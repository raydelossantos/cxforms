<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  UserLog extends Model {

    protected $table = 'user_logs';
    protected $primaryKey = 'id';

    /**
    * Get user
    */
    public function user() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id')->select(['user_id', 'first_name', 'last_name', 'username']);
    }

    protected $fillable = [
        'user_id',
        'activity',
        'ip_address',
        'user_agent',
    ];
}