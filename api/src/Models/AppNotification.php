<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use \Carbon\Carbon;

class  AppNotification extends Model {

    protected $table = 'app_notifications';
    protected $primaryKey = 'id';

    /**
    * Get form via ID
    */
    public function form() {
        return $this->hasOne('App\Models\Form', 'id', 'form_id');
    }

    /**
    * Get user_id
    */
    public function user() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id');
    }
    
    protected $fillable = [
        'user_id',
        'link',
        'hash',
        'is_opened',
        'label',
        'type',
        'icon',
        'form_id',
        'record_id',
        'deleted'
    ];
}