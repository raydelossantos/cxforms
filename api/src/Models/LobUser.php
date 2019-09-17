<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  LobUser extends Model {

    protected $table = 'lob_user';
    protected $primaryKey = 'id';


    /**
    * Get users (assigned to manage clients - admins)
    */
    public function user() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id');
    }

    /**
    * Get author
    */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'created_by');
    }

    /**
    * Get lob
    */
    public function lob() {
        return $this->hasOne('App\Models\LineOfBusiness', 'id', 'lob_id');
    }

    /**
    * Get client info
    */
    public function client() {
        return $this->hasOne('App\Models\Client', 'id', 'client_id');
    }


    protected $fillable = [
        'user_id',
        'lob_id',
        'client_id',
        'manage_forms',
        'add_form',
        'created_by'
    ];

}