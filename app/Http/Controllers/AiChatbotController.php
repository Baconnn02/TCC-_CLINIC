<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => ['required', 'array', 'max:20'],
            'messages.*.role' => ['required', 'in:user,model'],
            'messages.*.content' => ['required', 'string', 'max:4000'],
        ]);

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-2.5-flash');

        if (!$apiKey) {
            return response()->json([
                'message' => 'Gemini API key is not configured.'
            ], 500);
        }

        /*
        |--------------------------------------------------------------------------
        | Convert messages to Gemini format
        |--------------------------------------------------------------------------
        */

        $contents = collect($request->messages)
            ->map(function ($message) {
                return [
                    'role' => $message['role'],
                    'parts' => [
                        [
                            'text' => $message['content']
                        ]
                    ]
                ];
            })
            ->values()
            ->all();

        /*
        |--------------------------------------------------------------------------
        | Make sure the first message is from the user
        |--------------------------------------------------------------------------
        */

        while (
            !empty($contents) &&
            $contents[0]['role'] !== 'user'
        ) {
            array_shift($contents);
        }

        if (empty($contents)) {
            return response()->json([
                'message' => 'Please enter a message.'
            ], 422);
        }

        try {

            /*
            |--------------------------------------------------------------------------
            | Gemini API URL
            |--------------------------------------------------------------------------
            */

            $url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                . $model
                . ":generateContent";

            /*
            |--------------------------------------------------------------------------
            | Send request to Gemini
            |--------------------------------------------------------------------------
            */

            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
            ])
                ->timeout(60)
                ->acceptJson()
                ->post($url, [
                    'system_instruction' => [
                        'parts' => [
                            [
                                'text' =>
                                    "You are the AI assistant for the TCC Clinic Management System.

You are connected to the TCC Clinic Management System through the Laravel backend.

You can help users with:
- Clinic visits
- Students
- Faculty and staff
- Medicines
- Medicine inventory
- Monthly clinic reports
- Clinic statistics
- System navigation

IMPORTANT:
Answer questions clearly and professionally.

Do not invent:
- Student information
- Clinic records
- Medicine stock
- Patient information
- Report numbers

If actual database information has not been provided to you in the current request, do not make up the information.

For general questions, answer normally.

Keep answers short, clear, and easy to understand."
                            ],
                        ],
                    ],

                    'contents' => $contents,

                    'generation_config' => [
                        'temperature' => 0.4,
                        'max_output_tokens' => 800,
                    ],
                ]);

            /*
            |--------------------------------------------------------------------------
            | Gemini API Error
            |--------------------------------------------------------------------------
            */

            if ($response->failed()) {

                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'provider_message' => data_get(
                        $response->json(),
                        'error.message'
                    ),
                ]);

                return response()->json([
                    'message' => 'Gemini API Error',
                    'status' => $response->status(),
                    'error' => $response->json(),
                ], 502);
            }

            /*
            |--------------------------------------------------------------------------
            | Get Gemini response
            |--------------------------------------------------------------------------
            */

            $data = $response->json();

            $parts = data_get(
                $data,
                'candidates.0.content.parts',
                []
            );

            $message = collect($parts)
                ->pluck('text')
                ->filter()
                ->implode("\n");

            /*
            |--------------------------------------------------------------------------
            | Empty response
            |--------------------------------------------------------------------------
            */

            if (!$message) {

                Log::error('Gemini returned empty response', [
                    'status' => $response->status(),
                ]);

                return response()->json([
                    'message' => 'The AI returned an empty response.'
                ], 502);
            }


            return response()->json([
                'message' => $message
            ]);

        } catch (\Throwable $e) {

            Log::error('AI Chat Exception', [
                'exception' => get_class($e),
            ]);

            return response()->json([
                'message' => 'Unable to connect to the AI service.'
            ], 500);
        }
    }
}
