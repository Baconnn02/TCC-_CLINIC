<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $search = trim($validated['search'] ?? '');

        $staff = Staff::query()
            ->select([
                'id', 'staff_id', 'first_name', 'middle_name', 'last_name',
                'position', 'department', 'sex', 'birth_date',
                'contact_number', 'address', 'created_at', 'updated_at',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $contains = '%'.$search.'%';
                $query->where(function (Builder $query) use ($contains) {
                    $query->where('staff_id', 'like', $contains)
                        ->orWhere('first_name', 'like', $contains)
                        ->orWhere('middle_name', 'like', $contains)
                        ->orWhere('last_name', 'like', $contains)
                        ->orWhere('position', 'like', $contains)
                        ->orWhere('department', 'like', $contains)
                        ->orWhereRaw("CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?", [$contains]);
                });
            })
            ->orderBy('last_name')
            ->orderBy('id')
            ->paginate($validated['per_page'] ?? 25)
            ->withQueryString();

        return response()->json($staff);
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
