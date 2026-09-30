<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $search = trim($validated['search'] ?? '');

        $faculty = Faculty::query()
            ->select([
                'id', 'employee_id', 'first_name', 'middle_name', 'last_name',
                'position', 'department', 'sex', 'birth_date',
                'contact_number', 'address', 'created_at', 'updated_at',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $prefix = $search.'%';
                $query->where(function (Builder $query) use ($prefix) {
                    $query->where('employee_id', 'like', $prefix)
                        ->orWhere('first_name', 'like', $prefix)
                        ->orWhere('middle_name', 'like', $prefix)
                        ->orWhere('last_name', 'like', $prefix)
                        ->orWhere('position', 'like', $prefix)
                        ->orWhere('department', 'like', $prefix)
                        ->orWhereRaw("CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?", [$prefix]);
                });
            })
            ->orderBy('last_name')
            ->orderBy('id')
            ->paginate($validated['per_page'] ?? 25)
            ->withQueryString();

        return response()->json($faculty);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|string|max:255|unique:faculties,employee_id',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'sex' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $faculty = Faculty::create($validated);

        return response()->json($faculty, 201);
    }

    public function show(Faculty $faculty)
    {
        return response()->json($faculty);
    }

    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'employee_id' => 'required|string|max:255|unique:faculties,employee_id,' . $faculty->id,
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'sex' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $faculty->update($validated);

        return response()->json($faculty);
    }

    public function destroy(Faculty $faculty)
    {
        $faculty->delete();

        return response()->json([
            'message' => 'Faculty deleted successfully.'
        ]);
    }
}
