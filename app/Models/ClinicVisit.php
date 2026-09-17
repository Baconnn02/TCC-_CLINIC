<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicVisit extends Model
{
    protected $fillable = [
        'student_id',
        'faculty_id',
        'staff_id',
        'nurse_id',
        'visit_date',
        'reason',
        'symptoms',
        'temperature',
        'blood_pressure',
        'assessment',
        'treatment',
        'medicine_id',
        'medicine_quantity',
        'remarks',
    ];

    protected $casts = [
        'visit_date' => 'date:Y-m-d',
        'medicine_quantity' => 'integer',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function nurse()
    {
        return $this->belongsTo(User::class, 'nurse_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}