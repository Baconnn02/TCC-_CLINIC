<?php

namespace App\Http\Controllers;

use App\Models\ClinicVisit;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
       
                                      
       
    public function monthly(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        $month = (int) $request->month;
        $year = (int) $request->year;

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $visits = ClinicVisit::with([
            'student',
            'faculty',
            'staff',
            'nurse',
            'medicine',
        ])
            ->whereBetween('visit_date', [
                $startDate->toDateString(),
                $endDate->toDateString(),
            ])
            ->orderBy('visit_date')
            ->orderBy('id')
            ->get();

          
                                                                                   
                 
                                                                                   
          

        $totalVisits = $visits->count();

        $studentVisits = $visits
            ->whereNotNull('student_id')
            ->count();

        $facultyVisits = $visits
            ->whereNotNull('faculty_id')
            ->count();

        $staffVisits = $visits
            ->whereNotNull('staff_id')
            ->count();


          
                                                                                   
                       
                                                                                   
          

        $reasons = $visits
            ->groupBy(function ($visit) {
                return trim($visit->reason ?: 'Other');
            })
            ->map(function ($group, $reason) {
                return [
                    'reason' => $reason,
                    'count' => $group->count(),
                ];
            })
            ->sortByDesc('count')
            ->values();


          
                                                                                   
                        
                                                                                   
          

        $medicineUsage = $visits
            ->filter(function ($visit) {
                return $visit->medicine_id
                    && (int) $visit->medicine_quantity > 0;
            })
            ->groupBy('medicine_id')
            ->map(function ($group) {

                $medicine = $group->first()->medicine;

                return [
                    'medicine_id' => $medicine?->id,
                    'medicine_name' => $medicine?->medicine_name ?? 'Unknown',
                    'unit' => $medicine?->unit ?? '',
                    'quantity_used' => $group->sum(
                        fn ($visit) => (int) $visit->medicine_quantity
                    ),
                ];
            })
            ->sortByDesc('quantity_used')
            ->values();


          
                                                                                   
                                    
                                                                                   
          

        $medicines = Medicine::orderBy('medicine_name')
            ->get()
            ->map(function ($medicine) {

                $stock = (int) $medicine->stock;
                $minimum = (int) $medicine->minimum_stock;

                return [
                    'id' => $medicine->id,
                    'medicine_name' => $medicine->medicine_name,
                    'unit' => $medicine->unit,
                    'stock' => $stock,
                    'minimum_stock' => $minimum,

                    'status' => $stock <= 0
                        ? 'Out of Stock'
                        : (
                            $stock <= $minimum
                                ? 'Low Stock'
                                : 'Available'
                        ),
                ];
            })
            ->values();


          
                                                                                   
                      
                                                                                   
          

        $dailyVisits = $visits
            ->groupBy(function ($visit) {
                return Carbon::parse($visit->visit_date)
                    ->format('Y-m-d');
            })
            ->map(function ($group, $date) {

                return [
                    'date' => $date,
                    'count' => $group->count(),
                ];
            })
            ->values();


          
                                                                                   
                        
                                                                                   
          

        $nurseActivity = $visits
            ->filter(fn ($visit) => $visit->nurse)
            ->groupBy('nurse_id')
            ->map(function ($group) {

                $nurse = $group->first()->nurse;

                return [
                    'nurse_id' => $nurse?->id,
                    'name' => $nurse?->name ?? 'Unknown',
                    'visits' => $group->count(),
                ];
            })
            ->sortByDesc('visits')
            ->values();


          
                                                                                   
                       
                                                                                   
          

        $visitDetails = $visits->map(function ($visit) {

            $person = 'Unknown';
            $personType = 'Unknown';

              
                      
               
            if ($visit->student) {

                $student = $visit->student;

                $person = collect([
                    $student->first_name ?? null,
                    $student->middle_name ?? null,
                    $student->last_name ?? null,
                ])
                    ->filter()
                    ->implode(' ');

                $person = $person ?: 'Student';

                $personType = 'Student';
            }

              
                      
               
            elseif ($visit->faculty) {

                $faculty = $visit->faculty;

                $person = $this->getPersonName(
                    $faculty,
                    'Faculty'
                );

                $personType = 'Faculty';
            }

              
                    
               
            elseif ($visit->staff) {

                $staff = $visit->staff;

                $person = $this->getPersonName(
                    $staff,
                    'Staff'
                );

                $personType = 'Staff';
            }

            return [
                'id' => $visit->id,

                'date' => $visit->visit_date,

                'person' => $person,

                'person_type' => $personType,

                'reason' => $visit->reason,

                'medicine' => $visit->medicine?->medicine_name,

                'medicine_quantity' => $visit->medicine_quantity,

                'nurse' => $visit->nurse?->name,
            ];
        })
        ->values();


          
                                                                                   
                  
                                                                                   
          

        return response()->json([

            'report' => [
                'month' => $month,
                'year' => $year,
                'month_name' => $startDate->format('F'),
                'period' => $startDate->format('F Y'),
                'generated_at' => now()->toIso8601String(),
            ],

            'summary' => [
                'total_visits' => $totalVisits,
                'student_visits' => $studentVisits,
                'faculty_visits' => $facultyVisits,
                'staff_visits' => $staffVisits,
            ],

            'reasons' => $reasons,

            'medicine_usage' => $medicineUsage,

            'medicine_inventory' => $medicines,

            'daily_visits' => $dailyVisits,

            'nurse_activity' => $nurseActivity,

            'visits' => $visitDetails,
        ]);
    }


       
                                          
       
    private function getPersonName($person, string $fallback): string
    {
        if (!$person) {
            return $fallback;
        }

          
                                         
           
        if (!empty($person->name)) {
            return $person->name;
        }

          
                                                    
           
        $name = collect([
            $person->first_name ?? null,
            $person->middle_name ?? null,
            $person->last_name ?? null,
        ])
            ->filter()
            ->implode(' ');

        return $name ?: $fallback;
    }
}
