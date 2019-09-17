<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class  Team extends Model {

    use SoftDeletes;

    protected $table = 'teams';
    protected $primaryKey = 'id';

    /**
    * Get client info
    */
    public function client() {
        return $this->hasOne('App\Models\Client', 'id', 'client_id');
    }

    /**
    * Get team members
    */
    public function member() {
        return $this->hasMany('App\Models\TeamMember', 'team_id');
    }
    
    protected $fillable = [
        'team_name',
        'team_code',
        'location',
        'description',
        'client_id',
        'created_by'
    ];

}