<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  MailLog extends Model {

    protected $table = 'mail_logs';
    protected $primaryKey = 'id';

    /**
    * Get receiver
    */
    public function receiver_user() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'user_id')->select(['user_id', 'first_name', 'last_name', 'username']);
    }

    protected $fillable = [
        'user_id',
        'receiver',
        'sender',
        'subject',
        'custom',
        'body',
        'link',
        'hash',
        'is_sent',
        'is_opened'
    ];
}