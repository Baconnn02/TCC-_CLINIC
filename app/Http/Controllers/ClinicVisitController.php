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
    /*
    |--------------------------------------------------------------------------
    | DISPLAY ALL CLINIC VISITS
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        return response()->json(
            ClinicVisit::with([
                'student',
                'faculty',
                'staff',
                'nurse',
                'medicine',
            ])
                ->latest('visit_date')
                ->get()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ADD CLINIC VISIT
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'nullable|exists:students,id',
            'faculty_id' => 'nullable|exists:faculties,id',
            'staff_id' => 'nullable|exists:staff,id',

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

        $this->validatePatient($validated);

        $this->validateNurse($validated['nurse_id']);

        $visit = DB::transaction(function () use ($validated) {

            /*
            |--------------------------------------------------------------------------
            | DEDUCT MEDICINE STOCK
            |--------------------------------------------------------------------------
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

            /*
            |--------------------------------------------------------------------------
            | CREATE VISIT
            |--------------------------------------------------------------------------
            */

            return ClinicVisit::create($validated);
        });

        return response()->json(
            $visit->load([
                'student',
                'faculty',
                'staff',
                'nurse',
                'medicine',
            ]),
            201
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DISPLAY ONE CLINIC VISIT
    |--------------------------------------------------------------------------
    */

    public function show(ClinicVisit $clinicVisit)
    {
        return response()->json(
            $clinicVisit->load([
                'student',
                'faculty',
                'staff',
                'nurse',
                'medicine',
            ])
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CLINIC VISIT
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        ClinicVisit $clinicVisit
    ) {
        $validated = $request->validate([
            'student_id' => 'nullable|exists:students,id',
            'faculty_id' => 'nullable|exists:faculties,id',
            'staff_id' => 'nullable|exists:staff,id',

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

        $this->validatePatient($validated);

        $this->validateNurse($validated['nurse_id']);

        DB::transaction(function () use (
            $validated,
            $clinicVisit
        ) {

            $oldMedicineId = $clinicVisit->medicine_id;

            $oldQuantity = (int) (
                $clinicVisit->medicine_quantity ?? 0
            );

            $newMedicineId = $validated['medicine_id'] ?? null;

            $newQuantity = $newMedicineId
                ? (int) ($validated['medicine_quantity'] ?? 0)
                : 0;

            /*
            |--------------------------------------------------------------------------
            | LOCK ALL AFFECTED MEDICINES
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | RETURN OLD MEDICINE QUANTITY
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | DEDUCT NEW MEDICINE QUANTITY
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | UPDATE VISIT
            |--------------------------------------------------------------------------
            */

            $clinicVisit->update($validated);
        });

        return response()->json(
            $clinicVisit
                ->fresh()
                ->load([
                    'student',
                    'faculty',
                    'staff',
                    'nurse',
                    'medicine',
                ])
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE CLINIC VISIT
    |--------------------------------------------------------------------------
    */

    public function destroy(ClinicVisit $clinicVisit)
    {
        DB::transaction(function () use ($clinicVisit) {

            $medicineId = $clinicVisit->medicine_id;

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
    private function normalizeMedicineData(
        array $validated
    ): array {
        $treatment =
            $validated['treatment'] ?? null;
        if ($treatment === 'Medication') {

            if (
                empty($validated['medicine_id'])
            ) {
                throw ValidationException::withMessages([
                    'medicine_id' => [
                        'Please select a medicine.'
                    ],
                ]);
            }

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
        }

        /*
        |--------------------------------------------------------------------------
        | OTHER TREATMENTS
        |--------------------------------------------------------------------------
        */

        else {
            $validated['medicine_id'] = null;
            $validated['medicine_quantity'] = null;
        }

        return $validated;
    }
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
    private function validatePatient(
        array $validated
    ) {
        $patientIds = [
            $validated['student_id'] ?? null,
            $validated['faculty_id'] ?? null,
            $validated['staff_id'] ?? null,
        ];

        $selectedPatients = collect($patientIds)
            ->filter(
                fn ($id) => !empty($id)
            );

        if (
            $selectedPatients->count() === 0
        ) {
            throw ValidationException::withMessages([
                'person' => [
                    'Student, Faculty, or Staff is required.',
                ],
            ]);
        }

        if (
            $selectedPatients->count() > 1
        ) {
            throw ValidationException::withMessages([
                'person' => [
                    'A clinic visit can only belong to one patient type.',
                ],
            ]);
        }
    }
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