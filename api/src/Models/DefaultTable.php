<?php

namespace App\Models;

use \Illuminate\Database\Eloquent\Model;

class  DefaultTable extends Model {

    use BindsDynamically;
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = array('*');
    // protected $guarded = ['id'];
    public $timestamps = false;

    /**
     * @param $tableName
     * @param array $attributes
     */
    public function __construct($tableName)
    {
        $this->setTable('qa_' . print_r($tableName,true));
        parent::__construct();
    }

    /**
     * Set the table associated with the model.
     *
     * @param  $table
     * @return void
     */
    public function setTable($table)
    {
        $this->table = $table;
    }

    /**
    * Get creator info (created_by_userid)
    */
    public function creator() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'created_by_userid')
                    ->select(['user_id', 'employee_id', 'first_name', 'middle_name', 'last_name', 'username', 'email']);
    }
    
    /**
    * Get last modified by info (last_modified_by_userid)
    */
    public function modifier() {
        return $this->hasOne('App\Models\UserInfo', 'user_id', 'last_modified_by_userid')
                    ->select(['user_id', 'employee_id', 'first_name', 'middle_name', 'last_name', 'username', 'email']);
    }
    

    /**
    * Get attachment if form attachment
    */
    public function attachment() {
        return $this->hasMany('App\Models\Attachment', 'record_id', 'id')->where('table_name', $this->table);
    }

}

trait BindsDynamically
{
    protected $connection = null;
    protected $table = null;

    public function bind(string $connection, string $table)
    {
       $this->setConnection($connection);
       $this->setTable($table);
    }

    public function newInstance($attributes = [], $exists = false)
    {
    // Overridden in order to allow for late table binding.

       $model = parent::newInstance($attributes, $exists);
       $model->setTable($this->table);

       return $model;
    }

}