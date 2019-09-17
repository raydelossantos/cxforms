<?php

namespace App\Console;

use \Interop\Container\ContainerInterface;
use \RuntimeException;

use App\Models\FormField;
use App\Models\SystemLog;

class LookupScopeIdDbFixer {

    /** @var ContainerInterface */
    protected $container;

    private $db;
    private $logger;
    private $settings;


    /** 
     * Constructor
     *
     * @param ContainerInterface $container
     * @return void
     */
    public function __construct(ContainerInterface $container) {

        $this->container = $container;
        $this->logger = $container['logger'];

        $this->settings =  $this->container->get('settings');

    }

    /** 
     * Database Fixer script
     * this class should run after migrating to multiple
     * lookup scope id on creating and updating existing 
     * form_field. See this ticket: https://agileboard.cloudstaff.com/issues/33662
     * 
     * @param array $args
     * @return void
     */
    public function command($args) {

        $start_time = date("Y-m-d h:i:s");

        $this->logger->info('Migration from LookupScopeIdDbFixer started: ' . $start_time);

        // select all field record
        $fields = FormField::select('id', 'field_type', 'lookup_scope_id')
                           ->withTrashed()
                           ->get();

        if ( !empty($fields) ) {
            foreach($fields as $field) {
                if ( !is_array( json_decode($field->lookup_scope_id) ) ) {
                    if ( $field->lookup_scope_id == 0 ) {
                        $field->lookup_scope_id = "[]";
                    } else {
                        $field->lookup_scope_id = "[ $field->lookup_scope_id ]";
                    }
                    $field->save();
                }
            }
        }

        $end_time = date("Y-m-d h:i:s");

        // leave a footprint on system_logs table
        SystemLog::create(
            [
                'script_name'       => 'LookupScopeIdDbFixer',
                'activity'          => 'LookupScopeIdDbFixer migration from INT to JSON table data type.',
                'start_time'        => $start_time,
                'end_time'          => $end_time,
                'remarks'           => 'Successfully migrated existing data: '
            ]
        );

        $this->logger->info('Migration from LookupScopeIdDbFixer finished: ' . $end_time);
    }
}