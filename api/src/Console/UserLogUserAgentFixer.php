<?php

namespace App\Console;

use \Interop\Container\ContainerInterface;
use \RuntimeException;

use App\Models\UserLog;
use App\Models\SystemLog;

class UserLogUserAgentFixer {

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

        $this->logger->info('Migration from @sonarlogic.biz to @cloudstaff.com fixer script started: ' . $start_time);

        // select all field record
        $logs = UserLog::all();

        $count = 0;

        if ( count($logs) > 0) {
            foreach($logs as $log) {
                $log->user_agent = $this->getBrowserName($log->user_agent);
                $log->save();

                $count += 1;
            }
        }

        $end_time = date("Y-m-d h:i:s");

        // leave a footprint on system_logs table
        SystemLog::create(
            [
                'script_name'       => 'UserLogUserAgentFixer',
                'activity'          => 'UserLogUserAgentFixer fixed log agent details to proper browser names.',
                'start_time'        => $start_time,
                'end_time'          => $end_time,
                'remarks'           => 'Successfully fixed all existing data. Total count: ' . $count
            ]
        );

        $this->logger->info('UserLogUserAgentFixer script has finished: ' . $end_time);
    }

    private function getBrowserName($user_agent) {
        if (strpos($user_agent, 'Opera') || strpos($user_agent, 'OPR/')) return 'Opera';
        elseif (strpos($user_agent, 'Edge')) return 'Microsoft Edge';
        elseif (strpos($user_agent, 'Chrome')) return 'Google Chrome';
        elseif (strpos($user_agent, 'Safari')) return 'Safari';
        elseif (strpos($user_agent, 'Firefox')) return 'Mozilla Firefox';
        elseif (strpos($user_agent, 'MSIE') || strpos($user_agent, 'Trident/7')) return 'Internet Explorer';
        
        return 'Other';
    }
}