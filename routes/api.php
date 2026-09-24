<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StudentController;
use App\Http\Controllers\ClinicVisitController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\AiChatbotController;
use App\Http\Controllers\ReportController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Login does NOT require authentication
Route::post('/login', [AuthController::class, 'login']);


// Test route
Route::get('/test-students', function () {
    return response()->json(
        \App\Models\Student::with('clinicVisits')
            ->latest()
            ->get()
    );
});


/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::put('/profile', [AuthController::class, 'updateProfile']);


    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);


    // Students
    Route::apiResource('students', StudentController::class);


    // Staff
    Route::apiResource('staff', StaffController::class);


    // Clinic Visits
    Route::apiResource('clinic-visits', ClinicVisitController::class);

    Route::get('/nurses', [ClinicVisitController::class, 'nurses']);


    // Medicines
    Route::apiResource('medicines', MedicineController::class);


    // TCC AI Chatbot
    Route::post('/ai-chat', [AiChatbotController::class, 'chat']);


    // Monthly Reports
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);

});