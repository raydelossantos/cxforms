<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  ClientUser extends Model {

    protected $table = 'client_user';
    protected $primaryKey = 'id';

    /**
    * Get users (assigned to manage clients - admins)
    */
    public function user() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id');
    }

    /**
    * Get creator/author
    */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'id', 'created_by');
    }

    /**
    * Get client info
    */
    public function client() {
        return $this->hasOne('App\Models\Client', 'id', 'client_id');
    }

    protected $fillable = [
        'user_id',
        'client_id',
        'manage_info',
        'manage_lob',
        'manage_forms',
        'created_by'
    ];

}