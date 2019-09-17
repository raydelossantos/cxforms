<?php

namespace App\Console;

use \Interop\Container\ContainerInterface;
use \RuntimeException;

use App\Models\SystemLog;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class DatabaseBackuper {

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
     * Database Backup script
     * 
     * @param array $args
     * @return void
     */
    public function command($args) {

        $lock_file = '/tmp/qagold_backup.lock';

        if (file_exists($lock_file)) {
            $this->logger->error('Error: File lock exists. Backup cannot proceed unless previous process has completed and lock file has deleted: ' . $lock_file);
            exit;
        }

        $start_time = date("Y-m-d h:i:s");

        exec('touch ' . $lock_file);

        # AWS S3 Bucket upload ** IF AVAILABLE
        // $_AWS_ACCESS_KEY_ID     = $this->settings['aws']['id'];
        // $_AWS_SECRET_ACCESS_KEY = $this->settings['aws']['key'];
        // $_AWS_DEFAULT_REGION    = $this->settings['aws']['region'];
        // $_S3_BUCKET             = $this->settings['aws']['bucket'];

        # specify mysql credentials to allow backups
        $_MYSQL_HOST = $this->settings['db']['host'];
        $_MYSQL_PORT = $this->settings['db']['port'];
        $_MYSQL_USER = $this->settings['db']['username'];
        $_MYSQL_PASS = $this->settings['db']['password'];
        $_MYSQL_DB   = $this->settings['db']['database'];

        $_filename = $this->settings['db_backup_path'] . 'qa_gold_backup_' . date("Y_m_d_h_i_s") . '.sql';

        # start backup script here:
        $sh = 'mysqldump --host ' . $_MYSQL_HOST . ' --port  ' . $_MYSQL_PORT . ' -u ' . $_MYSQL_USER . ' --password="' . $_MYSQL_PASS . '" ' . $_MYSQL_DB . '> ' . $_filename;

        $backup = exec($sh);

        $this->logger->info($backup);

        unlink($lock_file);

        $end_time = date("Y-m-d h:i:s");
        
        // leave a footprint on system_logs table
        SystemLog::create(
            [
                'script_name'       => 'DatabaseBackuper',
                'activity'          => 'CRON: Database backup initiated.',
                'start_time'        => $start_time,
                'end_time'          => $end_time,
                'remarks'           => 'Successfully created a backup: ' . $_filename
            ]
        );

    }
}