<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LineOfBusiness extends Model {

    use SoftDeletes;

    protected $table = 'lines_of_business';
    protected $primaryKey = 'id';
    protected $dates = ['deleted_at'];
    
    /**
     * Get all forms for this LOB
     */
    public function forms() {
        return $this->hasMany('App\Models\Form', 'lob_id')->with('creator');
    }

    /**
     * Get creator for lob
     */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'created_by');
    }

    /**
     * Get client for lob
     */
    public function client() {
        return $this->hasOne('App\Models\Client', 'id', 'client_id');
    }

    /**
     * Get lob_users (lob admins)
     */
    public function user() {
        return $this->hasMany('App\Models\LobUser', 'lob_id', 'id')
                    ->with('creator')
                    ->with('user');
    }


    protected $fillable = [
        'lob_name',
        'description',
        'created_by',
        'client_id'
    ];
}