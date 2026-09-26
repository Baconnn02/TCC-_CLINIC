<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    /**
     * Display all medicines.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_summary' => ['nullable', 'boolean'],
        ]);
        $search = trim($validated['search'] ?? '');

        $medicines = Medicine::query()
            ->select([
                'id',
                'medicine_name',
                'treatment_type',
                'unit',
                'stock',
                'minimum_stock',
                'description',
                'created_at',
                'updated_at',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $prefix = $search.'%';

                $query->where(function (Builder $query) use ($prefix) {
                    $query->where('medicine_name', 'like', $prefix)
                        ->orWhere('treatment_type', 'like', $prefix)
                        ->orWhere('unit', 'like', $prefix);
                });
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate($validated['per_page'] ?? 25)
            ->withQueryString();

        if (!($validated['include_summary'] ?? false)) {
            return response()->json($medicines);
        }

        $summaryQuery = Medicine::query()
            ->selectRaw('COALESCE(SUM(stock), 0) as total_stock')
            ->selectRaw('SUM(CASE WHEN stock > 0 AND stock <= minimum_stock THEN 1 ELSE 0 END) as low_stock_count')
            ->selectRaw('SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out_of_stock_count');

        if ($search !== '') {
            $summaryQuery->selectRaw('COUNT(*) as total_medicines');
        }

        $summary = $summaryQuery->first();

        $payload = $medicines->toArray();
        $payload['summary'] = [
            'total_medicines' => $search === ''
                ? $medicines->total()
                : (int) $summary->total_medicines,
            'total_stock' => (int) $summary->total_stock,
            'low_stock_count' => (int) $summary->low_stock_count,
            'out_of_stock_count' => (int) $summary->out_of_stock_count,
        ];

        return response()->json($payload);
    }

    /**
     * Store a new medicine.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_name' => 'required|string|max:255',
            'treatment_type' => 'nullable|string|max:255',
            'unit' => 'required|string|max:100',
            'stock' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $medicine = Medicine::create($validated);

        return response()->json([
            'message' => 'Medicine added successfully.',
            'medicine' => $medicine,
        ], 201);
    }

    /**
     * Display one medicine.
     */
    public function show(Medicine $medicine)
    {
        return response()->json($medicine);
    }

    /**
     * Update medicine.
     */
    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'medicine_name' => 'required|string|max:255',
            'treatment_type' => 'nullable|string|max:255',
            'unit' => 'required|string|max:100',
            'stock' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $medicine->update($validated);

        return response()->json([
            'message' => 'Medicine updated successfully.',
            'medicine' => $medicine,
        ]);
    }

    /**
     * Delete medicine.
     */
    public function destroy(Medicine $medicine)
    {
        $medicine->delete();

        return response()->json([
            'message' => 'Medicine deleted successfully.',
        ]);
    }
}
