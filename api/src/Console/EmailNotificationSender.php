<?php

namespace App\Console;

use \Interop\Container\ContainerInterface;
use \RuntimeException;

use App\Controllers\MailController;

use App\Models\MailLog;
use App\Models\SystemLog;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailNotificationSender {

    /** @var ContainerInterface */
    protected $container;

    private $db;
    private $logger;

    private $mail;

    /** 
     * Constructor
     *
     * @param ContainerInterface $container
     * @return void
     */
    public function __construct(ContainerInterface $container) {
        // access container classes
        // eg $container->get('redis');
        $this->container = $container;
        $this->logger = $container['logger'];

        $settings =  $this->container->get('settings');

        $this->mail = new MailController($this->logger, $this->container->get('settings'));

    }

    /** 
     * EmailNotificationSender command
     * 
     * @param array $args
     * @return void
     */
    public function command($args) {

        $lock_file = '/tmp/qagold_email.lock';

        if (file_exists($lock_file)) {
            $this->logger->error('Error: File lock exists. Sending email cannot proceed unless previous process has completed and lock file has deleted: ' . $lock_file);
            exit;
        }

        $mail_queue = MailLog::where('is_sent', 0)->get();
        $ctr = 0;

        if ( count($mail_queue) > 0 ) {

            $start_time = date("Y-m-d h:i:s");

            exec('touch ' . $lock_file);

            foreach($mail_queue as $mailq) {
                $to         = json_decode($mailq['receiver']);
                $from       = json_decode($mailq['sender']);
                $subject    = $mailq['subject'];
                $body       = $mailq['body'];
                $custom     = (array) json_decode($mailq['custom']);

                $is_sent = $this->mail->send($from, $to, $subject, $body, $custom);

                if ( $is_sent ) {
                    $mail_rec = MailLog::find($mailq['id']);
                    $mail_rec->is_sent = true;
                    $mail_rec->save();

                    $ctr++;
                }
            }

            unlink($lock_file);
            $end_time = date("Y-m-d h:i:s");
            
            // leave a footprint on system_logs table
            SystemLog::create(
                [
                    'script_name'       => 'EmailNotificationSender',
                    'activity'          => 'CRON: Email notification sender schedule.',
                    'start_time'        => $start_time,
                    'end_time'          => $end_time,
                    'remarks'           => 'Sent a total of ' . $ctr . ' emails.'
                ]
            );

        }
    }
}