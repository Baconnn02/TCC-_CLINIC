<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\ClinicVisit;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_students' => Student::count(),
            'total_visits' => ClinicVisit::count(),
            'total_records' => ClinicVisit::count(),
            'recent_visits' => ClinicVisit::with('student')
                ->latest('visit_date')
                ->take(5)
                ->get(),
        ]);
    }
}