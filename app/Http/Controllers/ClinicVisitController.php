<?php

namespace App\Http\Controllers;

use App\Models\ClinicVisit;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClinicVisitController extends Controller
{
    /**
     * Display all clinic visits.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'faculty_id' => ['nullable', 'integer', 'exists:faculties,id'],
            'staff_id' => ['nullable', 'integer', 'exists:staff,id'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $search = trim($validated['search'] ?? '');

        $query = ClinicVisit::query()
            ->select([
                'id',
                'student_id',
                'faculty_id',
                'staff_id',
                'nurse_id',
                'medicine_id',
                'medicine_quantity',
                'visit_date',
                'reason',
                'symptoms',
                'temperature',
                'blood_pressure',
                'assessment',
                'treatment',
                'remarks',
                'created_at',
                'updated_at',
            ])
            ->with([
                'student:id,student_id,first_name,middle_name,last_name',
                'faculty:id,employee_id,first_name,middle_name,last_name',
                'staff:id,staff_id,first_name,middle_name,last_name',
                'nurse:id,name,email,role',
                'medicine:id,medicine_name,unit',
            ])
            ->when($validated['student_id'] ?? null, fn (Builder $query, int $id) => $query->where('student_id', $id))
            ->when($validated['faculty_id'] ?? null, fn (Builder $query, int $id) => $query->where('faculty_id', $id))
            ->when($validated['staff_id'] ?? null, fn (Builder $query, int $id) => $query->where('staff_id', $id))
            ->when($search !== '', function (Builder $query) use ($search) {
                $term = $search;
                $contains = '%'.$term.'%';

                $query->where(function (Builder $query) use ($contains) {
                    $query->where('reason', 'like', $contains)
                        ->orWhere('symptoms', 'like', $contains)
                        ->orWhere('temperature', 'like', $contains)
                        ->orWhere('blood_pressure', 'like', $contains)
                        ->orWhere('assessment', 'like', $contains)
                        ->orWhere('treatment', 'like', $contains)
                        ->orWhere('remarks', 'like', $contains)
                        ->orWhere('visit_date', 'like', $contains)
                        ->orWhereRaw('CAST(medicine_quantity AS CHAR) LIKE ?', [$contains])
                        ->orWhereHas('student', function (Builder $studentQuery) use ($contains) {
                            $studentQuery->where('student_id', 'like', $contains)
                                ->orWhere('first_name', 'like', $contains)
                                ->orWhere('middle_name', 'like', $contains)
                                ->orWhere('last_name', 'like', $contains);
                        })
                        ->orWhereHas('faculty', function (Builder $facultyQuery) use ($contains) {
                            $facultyQuery->where('employee_id', 'like', $contains)
                                ->orWhere('first_name', 'like', $contains)
                                ->orWhere('middle_name', 'like', $contains)
                                ->orWhere('last_name', 'like', $contains);
                        })
                        ->orWhereHas('staff', function (Builder $staffQuery) use ($contains) {
                            $staffQuery->where('staff_id', 'like', $contains)
                                ->orWhere('first_name', 'like', $contains)
                                ->orWhere('middle_name', 'like', $contains)
                                ->orWhere('last_name', 'like', $contains);
                        })
                        ->orWhereHas('nurse', fn (Builder $nurseQuery) => $nurseQuery->where('name', 'like', $contains))
                        ->orWhereHas('medicine', fn (Builder $medicineQuery) => $medicineQuery->where('medicine_name', 'like', $contains));
                });
            })
            ->latest('visit_date')
            ->latest('id');

        return response()->json(
            $query->paginate($validated['per_page'] ?? 25)->withQueryString()
        );
    }

    /**
     * Store a new clinic visit.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => [
                'nullable',
                'exists:students,id',
            ],

            'faculty_id' => [
                'nullable',
                'exists:faculties,id',
            ],

            'staff_id' => [
                'nullable',
                'exists:staff,id',
            ],

            'nurse_id' => [
                'required',
                'exists:users,id',
            ],

            'visit_date' => [
                'required',
                'date',
            ],

            'reason' => [
                'required',
                'string',
                'max:1000',
            ],

            'symptoms' => [
                'nullable',
                'string',
            ],

            'temperature' => [
                'nullable',
                'string',
                'max:50',
            ],

            'blood_pressure' => [
                'nullable',
                'string',
                'max:50',
            ],

            'assessment' => [
                'nullable',
                'string',
            ],

            'treatment' => [
                'nullable',
                'string',
            ],

            'medicine_id' => [
                'nullable',
                'exists:medicines,id',
            ],

            'medicine_quantity' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * Make sure exactly ONE patient type is selected.
         *
         * Student OR Faculty OR Staff
         */
        $patientIds = [
            'student_id' => $validated['student_id'] ?? null,
            'faculty_id' => $validated['faculty_id'] ?? null,
            'staff_id' => $validated['staff_id'] ?? null,
        ];

        $selectedPatients = collect($patientIds)
            ->filter(fn ($value) => !empty($value))
            ->count();

        if ($selectedPatients === 0) {
            throw ValidationException::withMessages([
                'patient' => [
                    'Please select a Student, Faculty, or Staff.'
                ],
            ]);
        }

        if ($selectedPatients > 1) {
            throw ValidationException::withMessages([
                'patient' => [
                    'Please select only one patient.'
                ],
            ]);
        }

        $validated = $this->normalizeMedicineData($validated);

        /*
         * Make sure selected user is a nurse.
         */
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

                $medicine->stock =
                    $currentStock - $quantity;

                $medicine->save();
            }

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

    /**
     * Display a single clinic visit.
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

    /**
     * Update an existing clinic visit.
     */
    public function update(
        Request $request,
        ClinicVisit $clinicVisit
    ) {
        $validated = $request->validate([
            'student_id' => [
                'nullable',
                'exists:students,id',
            ],

            'faculty_id' => [
                'nullable',
                'exists:faculties,id',
            ],

            'staff_id' => [
                'nullable',
                'exists:staff,id',
            ],

            'nurse_id' => [
                'required',
                'exists:users,id',
            ],

            'visit_date' => [
                'required',
                'date',
            ],

            'reason' => [
                'required',
                'string',
                'max:1000',
            ],

            'symptoms' => [
                'nullable',
                'string',
            ],

            'temperature' => [
                'nullable',
                'string',
                'max:50',
            ],

            'blood_pressure' => [
                'nullable',
                'string',
                'max:50',
            ],

            'assessment' => [
                'nullable',
                'string',
            ],

            'treatment' => [
                'nullable',
                'string',
            ],

            'medicine_id' => [
                'nullable',
                'exists:medicines,id',
            ],

            'medicine_quantity' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        /*
         * Make sure exactly ONE patient type is selected.
         */
        $patientIds = [
            'student_id' => $validated['student_id'] ?? null,
            'faculty_id' => $validated['faculty_id'] ?? null,
            'staff_id' => $validated['staff_id'] ?? null,
        ];

        $selectedPatients = collect($patientIds)
            ->filter(fn ($value) => !empty($value))
            ->count();

        if ($selectedPatients === 0) {
            throw ValidationException::withMessages([
                'patient' => [
                    'Please select a Student, Faculty, or Staff.'
                ],
            ]);
        }

        if ($selectedPatients > 1) {
            throw ValidationException::withMessages([
                'patient' => [
                    'Please select only one patient.'
                ],
            ]);
        }

        $validated = $this->normalizeMedicineData($validated);

        /*
         * Make sure selected user is a nurse.
         */
        $this->validateNurse($validated['nurse_id']);

        DB::transaction(function () use (
            $validated,
            $clinicVisit
        ) {

            $oldMedicineId =
                $clinicVisit->medicine_id;

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

                $oldMedicine =
                    $medicines->get(
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

                $newMedicine =
                    $medicines->get(
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

                if (
                    $availableStock <
                    $newQuantity
                ) {
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
            $clinicVisit->update(
                $validated
            );
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

    /**
     * Delete a clinic visit.
     *
     * If medicine was used, return the quantity
     * back to medicine stock.
     */
    public function destroy(
        ClinicVisit $clinicVisit
    ) {
        DB::transaction(
            function () use ($clinicVisit) {

                $medicineId =
                    $clinicVisit->medicine_id;

                $quantity = (int) (
                    $clinicVisit->medicine_quantity ?? 0
                );

                if (
                    $medicineId &&
                    $quantity > 0
                ) {

                    $medicine =
                        Medicine::where(
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
            }
        );

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
                empty(
                    $validated['medicine_quantity']
                ) ||
                (int) $validated[
                    'medicine_quantity'
                ] < 1
            ) {

                throw ValidationException::withMessages([
                    'medicine_quantity' => [
                        'Quantity used must be at least 1.'
                    ],
                ]);
            }

            $validated['medicine_quantity'] =
                (int) $validated[
                    'medicine_quantity'
                ];

        } else {

            $validated['medicine_id'] = null;

            $validated['medicine_quantity'] = null;
        }

        return $validated;
    }

    /**
     * Make sure the selected user is a nurse.
     */
    private function validateNurse(
        $nurseId
    ) {

        $nurse = User::where('id', $nurseId)
            ->where('role', 'Nurse')
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
            User::where('role', 'Nurse')
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
