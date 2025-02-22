<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BillHistoryController;
use App\Http\Controllers\BillController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {  
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Add the rooms.index and rooms.create routes
    Route::get('/rooms', function () {
        return Inertia::render('Rooms/Index');
    })->name('rooms.index');
    
    Route::get('/rooms/create', function () {
        return Inertia::render('Rooms/Create');
    })->name('rooms.create');
});

// Add the new route to render the Drink page
Route::get('/drink', function () {
    return Inertia::render('Drink');
})->name('drink');

// Add the new route to render the Staff page
Route::get('/staff', function () {
    return Inertia::render('Drink/Staff');
})->name('staff');

// Add the new route to render the Orders page
Route::get('/orders', function () {
    return Inertia::render('Drink/Orders');
})->name('orders');

// Add the new route to render the BillSummary page
Route::get('/billsummary', function () {
    return Inertia::render('Drink/Billsummary');
})->name('billsummary');

// Add the new route to render the BillHistory page
Route::get('/billhistory', function () {
    return Inertia::render('Drink/Billhistories');
})->name('billhistory');

// Add the new route for BillHistoryController
Route::get('/api/billhistories', [BillHistoryController::class, 'index']);

// Add the new route for handling bill payment
Route::post('/api/bills/pay', [BillController::class, 'pay']);

// Add the new route for handling bill completion
Route::patch('/api/bills/{bill}/complete', [BillController::class, 'complete']);

require __DIR__.'/auth.php';