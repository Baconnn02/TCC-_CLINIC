<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StudentController;
use App\Http\Controllers\ClinicVisitController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\AiChatbotController;
use App\Http\Controllers\ReportController;

Route::post('/login', [AuthController::class, 'login']);


// Test route
Route::get('/test-students', function () {
    return response()->json(
        \App\Models\Student::with('clinicVisits')
            ->latest()
            ->get()
    );
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::apiResource('students', StudentController::class);
    Route::apiResource('staff', StaffController::class);
    Route::apiResource('faculties', FacultyController::class);
    Route::apiResource('clinic-visits', ClinicVisitController::class);
    Route::get('/nurses', [ClinicVisitController::class, 'nurses']);
    Route::apiResource('medicines', MedicineController::class);
    Route::post('/ai-chat', [AiChatbotController::class, 'chat']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
});