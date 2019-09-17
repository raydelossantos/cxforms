<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  FormUser extends Model {

    protected $table = 'form_user';
    protected $primaryKey = 'id';

    /**
    * Get user_info for this each user
    */
    public function user_info() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id');
    }

    /**
    * Get user for this each user
    */
    public function user() {
        return $this->hasOne('App\Models\User', 'id', 'user_id')->withTrashed();
    }

    /**
    * Get form info for this each user
    */
    public function form() {
        return $this->hasOne('App\Models\Form', 'id', 'form_id');
    }

    /**
    * Get client info
    */
    public function client() {
        return $this->hasOne('App\Models\Client', 'id', 'client_id');
    }

    /**
    * Get lob info
    */
    public function lob() {
        return $this->hasOne('App\Models\LineOfBusiness', 'id', 'lob_id');
    }

    protected $fillable = [
        'user_id',
        'form_id',
        'lob_id',
        'client_id',
        'add_record',
        'view_own',
        'edit_own',
        'view_all',
        'edit_all',
        'export_data',
        'access_control',
        'configure_list',
        'created_by'
    ];

}