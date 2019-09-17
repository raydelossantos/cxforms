<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  TeamMember extends Model {

    protected $table = 'team_members';
    protected $primaryKey = 'id';

    /**
     * Get all user info for users
     */
    public function user_info() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id');
    }

    /**
     * Get team info
     */
    public function team() {
        return $this->hasOne('App\Models\Team', 'id', 'team_id');
    }

    protected $fillable = [
        'user_id',
        'team_id',
        'created_by'
    ];

}