<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  UserInfo extends Model {

    protected $table = 'user_info';
    protected $primaryKey = 'id';

    public function __construct(array $attributes = [])
    {
        $this->table = 'user_info';
        parent::__construct($attributes);
    }

    public function user() {
        $this->belongsTo('App\Models\User', 'user_id');
    }

    protected $fillable = [
        'username',
        'email',
        'user_origin',
        'user_id',
        'employee_id',
        'first_name',
        'middle_name',
        'last_name',
        'created_by'
    ];

}