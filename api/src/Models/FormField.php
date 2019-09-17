<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class  FormField extends Model {

    use SoftDeletes;

    protected $table = 'form_fields';
    protected $primaryKey = 'id';

    protected $fillable = [
        'form_id',
        'sort',
        'label',
        'description',
        'form_field_name',
        'short_id',
        'field_type',
        'size',
        'validation_mask',
        'dropdown_name',
        'selection_options',
        'lookup_scope_id',
        'lookup_list_id',
        'lookup_dependencies',
        'lookup_source_field',
        'timer_duration',
        'timer_react_action',
        'tag_button_text',
        'required',
        'readonly',
        'visibility',
        'role_restrictions_id',
        'group_name',
        'first_day_active',
        'last_day_active',
        'show_this_field_on_default_table_view',
        'maximum_display_characters',
        'url_timer_reset',
        'created_by',
    ];

}