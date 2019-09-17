<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  AdminPrivilege extends Model {

    protected $table = 'admin_privileges';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'user_id',
        'username',
        'display_name',
        'manage_admins',
        'manage_clients',
        'manage_users',
        'manage_teams',
        'manage_lob',
        'manage_forms'
    ];
}