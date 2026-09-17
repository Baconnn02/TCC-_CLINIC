<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        return response()->json(
            Student::with('clinicVisits.nurse')
                ->latest()
                ->get()
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

        return response()->json(
            $student->load('clinicVisits.nurse'),
            201
        );
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

        return response()->json(
            $student->fresh()->load('clinicVisits.nurse')
        );
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully.'
        ]);
    }
}