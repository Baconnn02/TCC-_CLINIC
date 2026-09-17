<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StudentController;
use App\Http\Controllers\ClinicVisitController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\MedicineController;


Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::apiResource('students', StudentController::class);
    Route::apiResource('staff', StaffController::class);
    
    Route::apiResource('clinic-visits', ClinicVisitController::class);
    route::get('/nurses', [ClinicVisitController::class, 'nurses']);
    Route::apiResource('medicines', MedicineController::class);
});