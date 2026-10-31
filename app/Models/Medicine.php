<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_name',
        'treatment_type',
        'expiration_date',
        'unit',
        'stock',
        'minimum_stock',
        'description',
    ];

    protected $casts = [
        'stock' => 'integer',
        'minimum_stock' => 'integer',
        'expiration_date' => 'date:Y-m-d',
    ];
}
