<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  AppUser extends Model {

    protected $table = 'app_users';
    protected $primaryKey = 'id';

    protected $fillable = [
        'username',
        'password',
        'status',
        'created_by'
    ];
}