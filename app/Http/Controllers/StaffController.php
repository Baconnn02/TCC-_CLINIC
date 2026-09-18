<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        return response()->json(
            Staff::orderBy('last_name')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => 'required|string|max:255|unique:staff,staff_id',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|in:Faculty,Staff',
            'department' => 'nullable|string|max:255',
            'sex' => 'required|in:Male,Female',
            'birth_date' => 'required|date',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
        ]);

        $staff = Staff::create($validated);

        return response()->json($staff, 201);
    }

    public function show(Staff $staff)
    {
        return response()->json($staff);
    }

    public function update(
        Request $request,
        Staff $staff
    ) {
        $validated = $request->validate([
            'staff_id' => 'required|string|max:255|unique:staff,staff_id,' . $staff->id,
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|in:Faculty,Staff',
            'department' => 'nullable|string|max:255',
            'sex' => 'required|in:Male,Female',
            'birth_date' => 'required|date',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
        ]);

        $staff->update($validated);

        return response()->json($staff);
    }

    public function destroy(Staff $staff)
    {
        $staff->delete();

        return response()->json([
            'message' =>
                'Staff/Faculty deleted successfully',
        ]);
    }
}