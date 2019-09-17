<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class  Attachment extends Model {

    protected $table = 'attachments';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'filename',
        'table_name',
        'record_id',
    ];
}