<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $search = trim($validated['search'] ?? '');

        $query = Student::query()
            ->select([
                'id',
                'student_id',
                'first_name',
                'middle_name',
                'last_name',
                'course',
                'year_level',
                'section',
                'sex',
                'birth_date',
                'contact_number',
                'address',
                'created_at',
                'updated_at',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $prefix = $search.'%';

                $query->where(function (Builder $query) use ($search, $prefix) {
                    $query->where('student_id', 'like', $prefix)
                        ->orWhere('first_name', 'like', $prefix)
                        ->orWhere('middle_name', 'like', $prefix)
                        ->orWhere('last_name', 'like', $prefix)
                        ->orWhere('course', 'like', $prefix)
                        ->orWhere('year_level', 'like', $prefix)
                        ->orWhere('section', 'like', $prefix);

                    if (str_contains($search, ' ')) {
                        $query->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            [$search.'%']
                        );
                    }
                });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        return response()->json(
            $query->paginate($validated['per_page'] ?? 25)->withQueryString()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|string|max:255|unique:students,student_id',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'year_level' => 'required|string|max:255',
            'section' => 'nullable|string|max:255',
            'sex' => 'required|string|max:50',
            'birth_date' => 'required|date',
            'contact_number' => 'required|string|max:50',
            'address' => 'required|string',
        ]);

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    public function show(Student $student)
    {
        return response()->json(
            $student->load('clinicVisits.nurse')
        );
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'student_id' => 'required|string|max:255|unique:students,student_id,' . $student->id,
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'year_level' => 'required|string|max:255',
            'section' => 'nullable|string|max:255',
            'sex' => 'required|string|max:50',
            'birth_date' => 'required|date',
            'contact_number' => 'required|string|max:50',
            'address' => 'required|string',
        ]);

        $student->update($validated);

        return response()->json($student->fresh());
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully.'
        ]);
    }
}
