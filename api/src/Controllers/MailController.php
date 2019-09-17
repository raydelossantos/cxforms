<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


class MailController {

    private $logger;
    private $mail;
    private $settings;

    /**
     * 
     */
    public function __construct(LoggerInterface $logger, $settings) {

        $this->logger = $logger;
        $this->settings = $settings;

        $this->mail = new PHPMailer(true);
        $this->mail->SMTPAuth = true;
        $this->mail->isSMTP();
        $this->mail->Charset = 'UTF-8';
        $this->mail->SMTPKeepAlive = true;
        $this->mail->SMTPDebug = $settings['smtp']['debug'];
        $this->mail->Host = $settings['smtp']['host'];
        $this->mail->Username = $settings['smtp']['username'];
        $this->mail->Password = $settings['smtp']['password'];
        $this->mail->Port = $settings['smtp']['port'];

        if (!empty($settings['smtp']['secure'])) {
            $this->mail->SMTPSecure = $settings['smtp']['secure'];
        }

    }

    // 
    public function send($from, $to, $subject, $body, $custom)
    {
        try {
            
            //Recipients
            $this->mail->setFrom($from[1], $from[0]);
            $this->mail->addReplyTo($from[1], $from[0]);
            $this->mail->addAddress($to[1], $to[0]);
            
            if ( !empty($custom['cc']) ) {
                foreach($custom['cc'] as $cc) :
                    if (filter_var($cc, FILTER_VALIDATE_EMAIL)) 
                        $this->mail->addBCC( trim($cc) );

                endforeach;
            }

            if ( !empty($custom['bcc']) ) {
                foreach($custom['bcc'] as $bcc) :
                    if (filter_var($bcc, FILTER_VALIDATE_EMAIL)) 
                        $this->mail->addBCC( trim($bcc) );

                endforeach;
            }

            //Content
            $this->mail->isHTML(true);                                  
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;
            $this->mail->AltBody = strip_tags($body);
        
            $this->mail->send();
            $this->mail->clearAddresses();

            return true;

        } catch (Exception $e) {

            return false;

        }

    }

}