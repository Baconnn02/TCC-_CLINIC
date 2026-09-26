<?php

namespace App\Http\Controllers;

use App\Models\ClinicVisit;
use App\Models\Student;

class DashboardController extends Controller
{
    public function index()
    {
        $totalStudents = Student::count();
        $totalVisits = ClinicVisit::count();
        $genderCounts = Student::query()
            ->select('sex')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('sex')
            ->get()
            ->mapWithKeys(fn ($row) => [
                strtolower((string) $row->sex) => (int) $row->total,
            ]);

        $monthStart = now()->subMonths(7)->startOfMonth()->toDateString();
        $monthlyVisits = ClinicVisit::query()
            ->where('visit_date', '>=', $monthStart)
            ->selectRaw("DATE_FORMAT(visit_date, '%Y-%m') as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'total_students' => $totalStudents,
            'total_visits' => $totalVisits,
            'total_records' => $totalVisits,
            'student_gender_counts' => [
                'male' => $genderCounts->get('male', 0),
                'female' => $genderCounts->get('female', 0),
            ],
            'monthly_visits' => $monthlyVisits,
            'recent_students' => Student::query()
                ->select([
                    'id',
                    'student_id',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'course',
                    'year_level',
                    'sex',
                    'created_at',
                ])
                ->latest('created_at')
                ->latest('id')
                ->limit(5)
                ->get(),
            'recent_visits' => ClinicVisit::query()
                ->select([
                    'id',
                    'student_id',
                    'visit_date',
                    'reason',
                    'created_at',
                ])
                ->with('student:id,first_name,middle_name,last_name')
                ->latest('visit_date')
                ->latest('id')
                ->limit(5)
                ->get(),
        ]);
    }
}
