<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

class SchemaBuilderController {
    private $db;
    private $logger;
    private $settings;

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db) {
        $this->logger = $logger;
        $this->db = $db;
        // $this->settings = $settings;
    }

    /**
     * Function to create table on the fly
     * 
     * @param array $table
     * @param array $field
     * @param string $_field_status - create or update or delete the field
     * 
     * @return boolean true|false
     */
    public static function manage_table($table_name) {
    
        $table_name = 'qa_' . $table_name;
        $sql = '';

        // Check if table exists
        $_qry = "SHOW TABLES LIKE '" . $table_name . "';";
        $_tables = DB::select($_qry);
    
        if (count($_tables) == 0) {

            // Table does not exists, create it!
            $sql .= "CREATE TABLE " . $table_name;

            // Start default fields
            $sql .= " (`id` INT NOT NULL AUTO_INCREMENT, ";
            $sql .= " `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,";
            $sql .= " `created_by_userid` INT NOT NULL,";
            $sql .= " `created_by_username` VARCHAR(100) NOT NULL,";
            $sql .= " `last_modified_by_userid` INT NULL,";
            $sql .= " `date_last_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,";
            $sql .= " `assigned_to_userid` VARCHAR(100) NULL,";
            $sql .= " `assigned_to_username` VARCHAR(100) NULL,";
            $sql .= " `assigned_to_role` TIMESTAMP NULL,";
            $sql .= " `date_assigned` TIMESTAMP NULL, ";
            $sql .= " PRIMARY KEY (`id`))";

            $_result = DB::statement($sql);

            if ($_result) {
                return true;
            } 

            return false;
        } 

    }

    /**
     * Manage Field on a given Table
     * @param string $table_name
     * @param array $_field
     * @param string $_field_status
     * 
     * @return boolean true|false
     */
    public static function manage_field($table_name, $_field, $_field_status) {
    
        $table_name = 'qa_' . $table_name;
        $sql = '';

        // Check if table exists
        $_qry = "SHOW TABLES LIKE '" . $table_name . "';";
        $_tables = DB::select($_qry);

        if (count($_tables) == 0) {
            return;             // table does not exists, return and do nothing???1
        } 

        if ($_field_status == 'create') {
            
            $sql .= "ALTER TABLE " .  $table_name;          // alter table
            $sql .= " ADD COLUMN " . $_field['name'];       // add column name
            $sql .= " " . $_field['type'];                  // include field type
            $sql .= " NULL";                                // null value accepted
            $_result = DB::statement($sql);

            if ($_result) {
                return true;
            }

            return false;

        } elseif ($_field_status == 'update') {

            $sql = "UPDATE TABLE " . $table_name . " (`id` INT);";

            $_result = DB::statement($sql);

            if ($_result) {
                return true;
            }

            return false;
            
        } elseif ($_field_status == 'delete') {
            
            $sql .= "ALTER TABLE DROP COLUMN " . $field['name'];
            $_result = DB::statement($sql);
            if ($_result) {
                return true;
            }

            return false;
        }
    
    }

    /**
     * Function to delete table on the fly
     * NOTE: HEAVY VALIDATIONS SHOULD BE ANTICIPATED
     * 
     * @param string $tableName
     * 
     * @return boolean true|false
     */
    public function deleteTable($tableName) {
        // validate write access/permission

    }


}
