<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  AccessLevel extends Model {

    protected $table = 'access_levels';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'display_name',
        'description',
        'is_admin',
        'is_manager',
        'is_client',
        'is_team_champ',
        'is_team_lead',
        'is_team_member',
        'is_custom',
        'created_by'
    ];
}