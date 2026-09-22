<?php

namespace App\Http\Controllers;

use App\Models\ClinicVisit;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClinicVisitController extends Controller
{
    /**
     * Display all clinic visits.
     */
    public function index()
    {
        return response()->json(
            ClinicVisit::with([
                'student',
                'nurse',
                'medicine',
            ])
                ->latest('visit_date')
                ->latest('id')
                ->get()
        );
    }

    /**
     * Store a new clinic visit.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'nurse_id' => 'required|exists:users,id',
            'visit_date' => 'required|date',

            'reason' => 'required|string|max:1000',
            'symptoms' => 'nullable|string',

            'temperature' => 'nullable|string|max:50',
            'blood_pressure' => 'nullable|string|max:50',

            'assessment' => 'nullable|string',
            'treatment' => 'nullable|string',

            'medicine_id' => 'nullable|exists:medicines,id',
            'medicine_quantity' => 'nullable|integer|min:1',

            'remarks' => 'nullable|string',
        ]);

        $validated = $this->normalizeMedicineData($validated);

        $this->validateNurse($validated['nurse_id']);

        $visit = DB::transaction(function () use ($validated) {

            /*
             * Deduct medicine stock when medicine is selected.
             */
            if (!empty($validated['medicine_id'])) {

                $medicine = Medicine::where(
                    'id',
                    $validated['medicine_id']
                )
                    ->lockForUpdate()
                    ->first();

                if (!$medicine) {
                    throw ValidationException::withMessages([
                        'medicine_id' => [
                            'Selected medicine was not found.'
                        ],
                    ]);
                }

                $quantity = (int) $validated['medicine_quantity'];
                $currentStock = (int) $medicine->stock;

                if ($currentStock < $quantity) {
                    throw ValidationException::withMessages([
                        'medicine_quantity' => [
                            "Insufficient stock for {$medicine->medicine_name}. Available stock: {$currentStock}."
                        ],
                    ]);
                }

                $medicine->stock = $currentStock - $quantity;
                $medicine->save();
            }

            return ClinicVisit::create($validated);
        });

        return response()->json(
            $visit->load([
                'student',
                'nurse',
                'medicine',
            ]),
            201
        );
    }

    /**
     * Display a single clinic visit.
     */
    public function show(ClinicVisit $clinicVisit)
    {
        return response()->json(
            $clinicVisit->load([
                'student',
                'nurse',
                'medicine',
            ])
        );
    }

    /**
     * Update an existing clinic visit.
     */
    public function update(
        Request $request,
        ClinicVisit $clinicVisit
    ) {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'nurse_id' => 'required|exists:users,id',
            'visit_date' => 'required|date',

            'reason' => 'required|string|max:1000',
            'symptoms' => 'nullable|string',

            'temperature' => 'nullable|string|max:50',
            'blood_pressure' => 'nullable|string|max:50',

            'assessment' => 'nullable|string',
            'treatment' => 'nullable|string',

            'medicine_id' => 'nullable|exists:medicines,id',
            'medicine_quantity' => 'nullable|integer|min:1',

            'remarks' => 'nullable|string',
        ]);

        $validated = $this->normalizeMedicineData($validated);

        $this->validateNurse($validated['nurse_id']);

        DB::transaction(function () use (
            $validated,
            $clinicVisit
        ) {

            $oldMedicineId = $clinicVisit->medicine_id;
            $oldQuantity = (int) (
                $clinicVisit->medicine_quantity ?? 0
            );

            $newMedicineId =
                $validated['medicine_id'] ?? null;

            $newQuantity = $newMedicineId
                ? (int) (
                    $validated['medicine_quantity'] ?? 0
                )
                : 0;

            /*
             * Get old and new medicine records.
             */
            $medicineIds = collect([
                $oldMedicineId,
                $newMedicineId,
            ])
                ->filter()
                ->unique()
                ->sort()
                ->values();

            $medicines = $medicineIds->isEmpty()
                ? collect()
                : Medicine::whereIn(
                    'id',
                    $medicineIds
                )
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

            /*
             * Return the old medicine stock.
             */
            if (
                $oldMedicineId &&
                $oldQuantity > 0
            ) {

                $oldMedicine = $medicines->get(
                    $oldMedicineId
                );

                if (!$oldMedicine) {
                    throw ValidationException::withMessages([
                        'medicine_id' => [
                            'The previously selected medicine no longer exists.'
                        ],
                    ]);
                }

                $oldMedicine->stock =
                    (int) $oldMedicine->stock +
                    $oldQuantity;

                $oldMedicine->save();
            }

            /*
             * Deduct the new medicine stock.
             */
            if (
                $newMedicineId &&
                $newQuantity > 0
            ) {

                $newMedicine = $medicines->get(
                    $newMedicineId
                );

                if (!$newMedicine) {
                    throw ValidationException::withMessages([
                        'medicine_id' => [
                            'Selected medicine was not found.'
                        ],
                    ]);
                }

                $availableStock =
                    (int) $newMedicine->stock;

                if ($availableStock < $newQuantity) {
                    throw ValidationException::withMessages([
                        'medicine_quantity' => [
                            "Insufficient stock for {$newMedicine->medicine_name}. Available stock: {$availableStock}."
                        ],
                    ]);
                }

                $newMedicine->stock =
                    $availableStock -
                    $newQuantity;

                $newMedicine->save();
            }

            /*
             * Update clinic visit.
             */
            $clinicVisit->update($validated);
        });

        return response()->json(
            $clinicVisit
                ->fresh()
                ->load([
                    'student',
                    'nurse',
                    'medicine',
                ])
        );
    }

    /**
     * Delete a clinic visit.
     *
     * If medicine was used, return the quantity
     * back to the medicine stock.
     */
    public function destroy(ClinicVisit $clinicVisit)
    {
        DB::transaction(function () use ($clinicVisit) {

            $medicineId =
                $clinicVisit->medicine_id;

            $quantity = (int) (
                $clinicVisit->medicine_quantity ?? 0
            );

            if (
                $medicineId &&
                $quantity > 0
            ) {

                $medicine = Medicine::where(
                    'id',
                    $medicineId
                )
                    ->lockForUpdate()
                    ->first();

                if ($medicine) {

                    $medicine->stock =
                        (int) $medicine->stock +
                        $quantity;

                    $medicine->save();
                }
            }

            $clinicVisit->delete();
        });

        return response()->json([
            'message' =>
                'Clinic visit deleted successfully.',
        ]);
    }

    /**
     * Normalize medicine information.
     *
     * Medicine is optional.
     */
    private function normalizeMedicineData(
        array $validated
    ): array {

        if (!empty($validated['medicine_id'])) {

            if (
                empty($validated['medicine_quantity']) ||
                (int) $validated['medicine_quantity'] < 1
            ) {

                throw ValidationException::withMessages([
                    'medicine_quantity' => [
                        'Quantity used must be at least 1.'
                    ],
                ]);
            }

            $validated['medicine_quantity'] =
                (int) $validated['medicine_quantity'];

        } else {

            $validated['medicine_id'] = null;

            $validated['medicine_quantity'] = null;
        }

        return $validated;
    }

    /**
     * Make sure the selected user is a nurse.
     */
    private function validateNurse($nurseId)
    {
        $nurse = User::where('id', $nurseId)
            ->whereRaw(
                'LOWER(role) = ?',
                ['nurse']
            )
            ->first();

        if (!$nurse) {
            throw ValidationException::withMessages([
                'nurse_id' => [
                    'Selected user is not a nurse.'
                ],
            ]);
        }
    }

    /**
     * Get all nurses.
     */
    public function nurses()
    {
        return response()->json(
            User::whereRaw(
                'LOWER(role) = ?',
                ['nurse']
            )
                ->select(
                    'id',
                    'name',
                    'email',
                    'role'
                )
                ->orderBy('name')
                ->get()
        );
    }
}