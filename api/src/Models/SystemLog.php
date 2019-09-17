<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  SystemLog extends Model {

    protected $table = 'system_logs';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'script_name',
        'activity',
        'remarks',
        'start_time',
        'end_time',
    ];
}