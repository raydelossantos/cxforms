<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model {

    use SoftDeletes;

    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $dates = ['deleted_at'];
    // protected $hidden = array('password'); // add columns to exclude

    public function __construct(array $attributes = [])
    {
        $this->table = 'users';
        parent::__construct($attributes);
    }

    /**
    * Get user_info for this each user
    */
    public function user_info() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'id');
    }

    /**
     * Get created_by info
     */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'created_by');
    }

    /**
     * Get admin privileges
     */
    public function privilege() {
        return $this->hasOne('App\Models\AdminPrivilege', 'user_id', 'id');
    }

    protected $fillable = [
        'username',
        'is_admin',
        'created_by'
    ];

}