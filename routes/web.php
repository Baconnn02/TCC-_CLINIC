<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    $frontendUrl = rtrim((string) config('services.frontend.url', 'http://localhost:5173'), '/');

    return redirect()->away($frontendUrl . '/login');
})->name('login');
