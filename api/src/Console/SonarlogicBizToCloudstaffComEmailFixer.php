<?php

namespace App\Console;

use \Interop\Container\ContainerInterface;
use \RuntimeException;

use App\Models\UserInfo;
use App\Models\SystemLog;

class SonarlogicBizToCloudstaffComEmailFixer {

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
     * this script is intended to fix all user agent fields 
     * in UserLog table to narrow to the correct User Agent/Browser used
     * when user logged in to Forms.
     * 
     * @param array $args
     * @return void
     */
    public function command($args) {

        $start_time = date("Y-m-d h:i:s");

        $this->logger->info('Migration from @sonarlogic.biz to @cloudstaff.com fixer script started: ' . $start_time);

        // select all field record
        $users = UserInfo::where('email', 'like', '%@sonarlogic.biz')->get();

        $count = 0;

        if ( count($users) > 0) {
            foreach($users as $user) {
                $user->email = str_replace('@sonarlogic.biz', '@cloudstaff.com', $user->email);
                $user->save();

                $count += 1;
            }
        }

        $end_time = date("Y-m-d h:i:s");

        // leave a footprint on system_logs table
        SystemLog::create(
            [
                'script_name'       => 'SonarlogicBizToCloudstaffComEmailFixer',
                'activity'          => 'SonarlogicBizToCloudstaffComEmailFixer migration from sonarlogic.biz to cloudstaff.com user emails.',
                'start_time'        => $start_time,
                'end_time'          => $end_time,
                'remarks'           => 'Successfully fixed all existing data. Total count: ' . $count
            ]
        );

        $this->logger->info('SonarlogicBizToCloudstaffComEmailFixer script has finished: ' . $end_time);
    }
}