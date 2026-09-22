<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    /**
     * Display all medicines.
     */
    public function index()
    {
        $medicines = Medicine::latest()->get();

        return response()->json($medicines);
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