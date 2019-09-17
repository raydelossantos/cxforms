<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class  Client extends Model {

    use SoftDeletes;

    protected $table = 'clients';
    protected $primaryKey = 'id';
    protected $dates = ['deleted_at'];

    /**
    * Get creator info (created_by)
    */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'created_by');
    }

    /**
    * Get LOB's associated with client
    * also include all users for each LOB
    */
    public function lob_user() {
        return $this->hasMany('App\Models\LineOfBusiness', 'client_id', 'id')
                    ->with('user');
    }

    /**
    * Get client users (client admin assigned to manage the client)
    */
    public function user() {
        return $this->hasMany('App\Models\ClientUser', 'client_id', 'id')
                    ->with('user')
                    ->with('creator');
    }
    
    protected $fillable = [
        'client_name',
        'description',
        'logo',
        'created_by'
    ];
}