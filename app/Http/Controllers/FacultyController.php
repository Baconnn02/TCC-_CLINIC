<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function index()
    {
        return response()->json(
            Faculty::orderBy('last_name')->get()
        );
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