<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class  Form extends Model {

    use SoftDeletes;

    protected $table = 'forms';
    protected $primaryKey = 'id';
    protected $dates = ['deleted_at'];

    /**
    * Get all fields for this form
    */
    public function fields() {
        return $this->hasMany('App\Models\FormField', 'form_id');
    }

    /**
    * Get author for this form
    */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'created_by');
    }

    /**
    * Get lob for this form
    */
    public function lob() {
        return $this->hasOne('App\Models\LineOfBusiness', 'id', 'lob_id');
    }
    
    protected $fillable = [
        'form_name',
        'description',
        'lob_id',
        'short_name',
        'table_name',
        'reports_url',
        'record_closed_criteria',
        'stay_after_submit',
        'show_submitters_info',
        'hide_values_in_emails',
        'created_by',
        'attachments',
        'max_records_in_list_view',
        'hash',
        'form_type'
    ];
}