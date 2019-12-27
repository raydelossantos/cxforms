<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

use Tuupola\Base62;
use Firebase\JWT\JWT;

use App\Models\User;
use App\Models\Form;
use App\Models\UserInfo;
use App\Models\UserLog;

// use Appp\Controllers\CommonController;

class AuthenticationController {
    private $db;
    private $logger;
    private $settings;

    private $ldap_server;
    private $asset_link;

    /**
     *  Google Authentication settings
     */
    private $client_id;
    private $client_redirect_url;
    private $client_secret;

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db, $settings)
    {
        $this->logger = $logger;
        $this->db = $db;
        $this->settings = $settings;
        
        $this->client_id            = $settings['client_id'];
        $this->client_redirect_url  = $settings['client_redirect_url'];
        $this->client_secret        = $settings['client_secret'];
        $this->ldap_server          = $settings['ldap_server'];
        $this->asset_link           = $settings['asset_link'];
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $args
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function pw_login(Request $request, Response $response, $args)
    {
        $result             = [];
        $result['status']   = 'success';
        $result['success']  = false;

        $request_data = $request->getParsedBody();

        /**
         * Validate input
         */
        if (empty($request_data['username']) || empty($request_data['password'])) {
            $result['status'] = 'Invalid username/password';
            $result['message'] = 'User was not found. Kindly inform Connext Form Admin.';
            return $response->withStatus(404)->withJson($result);
        }

        /**
         * Verify if user exists in users table before authenticating
         */
        $_user_check = User::where('username', $request_data['username'])->first();
        if ($_user_check) {
            if($_user_check->login_attempt == 5) {
                $result['status'] = 'Account Locked';
                $result['message'] = 'Your user account was locked due to multiple invalid login attempts. Kindly check your email to unlock or contact Administrator.';
                return $response->withStatus(401)->withJson($result);
            }

            $username = $request_data['username'];
            $password = $request_data['password'];
            
            if(password_verify($password, $_user_check->password)) {
                $user['username'] = $username;
                $user['image_link'] = $this->asset_link . $username;

                // get user details
                $user_details = User::select(['id', 'username', 'is_admin'])->where('username', $username)->first();

                // get user_info
                $user_info = UserInfo::select(['id', 'username', 'user_id', 'last_name', 'first_name', 'middle_name', 'email', 'employee_id', 'photo'])->where('username', $username)->first();

                if (empty($user_details) || empty($user_info)) {
                    $result['status'] = 'Invalid username/password';
                    $result['message'] = 'User was not found. Kindly inform Connext Form Admin.';

                    return $response->withStatus(404)
                                    ->withHeader("Content-Type", "application/json")
                                    ->withJson($result);
                }

                $user['info'] = [
                    'user' => $user_details,
                    'user_info' => $user_info
                ];

                $result = $this->_token($request, $user['info'], $this->settings['jwt_expiration']['ldap']);
                $result['status'] = "success";
                $result['success']  = true;

                // reset user invalid login details
                $user_details->login_attempt = 0;
                $user_details->update();

                // Log user login activity to db
                UserLog::create(
                    [
                        'user_id'       => $user_details['id'], 
                        'user_agent'    => $this->getBrowserName(json_encode($request->getHeader('User-Agent'))),
                        'ip_address'    => $this->getRealIpAddress(),
                        'activity'      => 'Logged in via LDAP.', 
                    ]
                );

                return $response->withStatus(200)
                                ->withHeader("Content-Type", "application/json")
                                ->write(json_encode($result, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
            }
            
            $user = User::where('username', $username)->with('user_info')->first();

            if(!empty($user)) {

                if (($user->login_attempt + 1) === 5) {
                    $hash = hash('sha256', sha1(uniqid().time()) );
                    $user->reset_hash = $hash;
                    $user->login_attempt = $user->login_attempt + 1;
                    $user->update();

                    // send email notificaitons when user has been locked
                    $receiver = [
                        $user->user_info->last_name . ', ' . $user->user_info->first_name . ' ' . $user->user_info->middle_name,
                        $user->user_info->email
                    ];

                    $notif = new CommonController($this->logger, $this->db, $this->settings);

                    $notif->send_notification(
                        'user_locked',
                        $hash,
                        $receiver
                    );

                    $result['status'] = 'Account Locked';
                    $result['message'] = 'Your user account was locked due to multiple invalid login attempts. Kindly contact Administrator.';
                    return $response->withStatus(401)->withJson($result);
                }

                $user->login_attempt = $user->login_attempt + 1;
                $user->update();
            }

        }

        $result['status'] = 'Invalid username/password';
        $result['message'] = 'User was not found. Kindly inform Connext Form Admin.';
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * This function covers the login using GOOGLE ACCOUNT
     * It connects to google api, get access_token, user_profiel_info
     * then redirects to angular URL to catch JWT TOKEN generated here
     * finally, it will store 
     */
    public function google_login(Request $request, Response $response, $args) {
        $gapi = new GoogleApi();
        $params = $request->getQueryParams();

        $data = $gapi->GetAccessToken($this->client_id, $this->client_redirect_url, $this->client_secret, $params["code"]);

        $access_token = $data['access_token'];

        if (!empty($access_token)) {
            $user_info = $gapi->GetUserProfileInfo($access_token);

            $email          = $user_info['emails'][0]['value'];
            $last_name      = $user_info['name']['familyName'];
            $first_name     = $user_info['name']['givenName'];
            $image_url      = $user_info['image']['url'];
            $user_domain    = $user_info['domain'];
            // $user_domain    = isset($user_info['domain']) ? $user_info['domain'] : '';
            
            // get user_info
            $user_info = UserInfo::select(['id', 'username', 'user_id', 'last_name', 'first_name', 'middle_name', 'email', 'employee_id'])->where('email', $email)->first();

            if ($user_info) {
                // get user details
                $user_details = User::select(['id', 'username', 'is_admin'])->where('id', $user_info->user_id)->first();

                if (!$user_details) {
                    header('Location: ' . $this->settings['redirect_url_invalid_login'] . '?success=invalid');
                    exit;
                }

                $user['info'] = [
                    'user' => $user_details,
                    'user_info' => $user_info
                ];

                // Log user login activity to db
                UserLog::create(
                    [
                        'user_id'       => $user_details['id'], 
                        'user_agent'    => $this->getBrowserName(json_encode($request->getHeader('User-Agent'))),
                        'ip_address'    => $this->getRealIpAddress(),
                        'activity'      => 'Logged in via Google.', 
                    ]
                );
                
                $token = $this->_token($request, $user['info'], $this->settings['jwt_expiration']['google']);

                header('Location: ' . $this->settings['redirect_url_google_login'] . $token['token'] . '/' . $token['expires']);
                exit;

            } elseif ($user_domain == 'sonarlogic.biz' || $user_domain == 'cloudstaff.com') {
                // adding flexibility to login.. user registered in db maybe 
                // @sonarlogic.biz or cloudstaff.com domain

                // explode email and get username
                $username = substr($email, 0, strpos($email, "@"));

                $email_cs = $username . '@cloudstaff.com';
                $email_sl = $username . '@sonarlogic.biz';

                $user_info = UserInfo::where('email', $email_cs)->whereOr('email', $email_sl)->first();

                if ($user_info) {
                    // get user details
                    $user_details = User::find($user_info->user_id);

                    if (!$user_details) {
                        header('Location: ' . $this->settings['redirect_url_invalid_login'] . '?success=invalid');
                        exit;
                    }

                    $user['info'] = [
                        'user' => $user_details,
                        'user_info' => $user_info
                    ];

                    // Log user login activity to db
                    UserLog::create(
                        [
                            'user_id'       => $user_details['id'], 
                            'user_agent'    => $this->getBrowserName(json_encode($request->getHeader('User-Agent'))),
                            'ip_address'    => $this->getRealIpAddress(),
                            'activity'      => 'Logged in via Google.', 
                        ]
                    );

                    $token = $this->_token($request, $user['info'], $this->settings['jwt_expiration']['google']);

                    header('Location: ' . $this->settings['redirect_url_google_login'] . $token['token'] . '/' . $token['expires']);
                    exit;
                }
            }
        }

		// $result['success'] = false;
        // $result['message'] = 'User was not found. Kindly inform Connext Form Admin.';
        // return $response->withStatus(403)->withJson($result);

        header('Location: ' . $this->settings['redirect_url_invalid_login'] . '?success=invalid');
        exit;
    }

    /**
     * End point for logging in via WorkPattern link
     * 
     * Conditions should be: form hash should be provided in the link
     * The form intended to open should have permission for WP User
     * The link will expire at a certain period
     * The referer URL should be from WorkPattern (this can be spoofed via JavaScript)
     * 
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function wp_login(Request $request, Response $response, $params)
    {
        $result             = [];
        $result['status']   = 'error';
        $result['success']  = false;

        // Get hash_id
        $form = Form::where('hash', $params['id'])->first();

        // Check if Work Pattern User has access to this form
        if (!$form || $form->form_type !== 1) {
            header('Location: ' . $this->settings['redirect_url_wp_invalid'] . '?success=invalid');
            exit;
        }

        // Verify referer URL - should match WorkPattern Domain in settings
        if (isset($_SERVER['HTTP_REFERER'])) {
            // Get WP Domain from settings
            $wp_domain = $this->settings['wp_domain'];
            $wp_username = $this->settings['wp_username'];

            // Parse referer URL from link
            $url_parts = parse_url($_SERVER['HTTP_REFERER']);
            $base_url = $url_parts['scheme'] . '://' . $url_parts['host'];
            
            if ($base_url === $wp_domain) {
                // Get Work Pattern user ** this user might have been added manually or via seeder
                $user_info = UserInfo::select(['id', 'username', 'user_id', 'last_name', 'first_name', 'middle_name', 'email', 'employee_id'])->where('username', $wp_username)->first();

                if ($user_info) {
                    // Get user details
                    $user_details = User::select(['id', 'username', 'is_admin'])->where('id', $user_info->user_id)->first();

                    if (!$user_details) {
                        header('Location: ' . $this->settings['redirect_url_wp_invalid'] . '?success=invalid');
                        exit;
                    }

                    $user['info'] = [
                        'user' => $user_details,
                        'user_info' => $user_info,
                        'form' => [
                            'id'    => $form->id,
                            'hash'  => $form->hash
                        ]
                    ];

                    // Generate JWT Token for this successful login
                    $token = $this->_token($request, $user['info'], $this->settings['jwt_expiration']['wp']);

                    // Redirect to URL to login to Angular UI and exit
                    header('Location: ' . $this->settings['redirect_url_wp_login'] . '/' . $form->hash . '/' . $token['token'] . '/' . $token['expires']);
                    exit;
                }
           }
        }

        header('Location: ' . $this->settings['redirect_url_wp_invalid'] . '?success=invalid');
        exit;
        // $result['message'] = 'Unable to login or open the form. Kindly contact administrators if you think this is wrong.';
        // return $response->withStatus(401)->withJson($result);
    }

    /**
     * Function to unblock user set login attempt to 0 & reset_hash to null
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function unblock(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = false;

        // $request_data = $request->getParsedBody();
        $username = $params['username'];
        $hash     = $params['hash'];

        $user = User::where('username', $username)
                      ->where('login_attempt', 5)
                      ->where('reset_hash', $hash)
                      ->first();

        if ($user) {
            $user->login_attempt = 0;
            $user->reset_hash = null;
            $data = $user->save();
            
            if ($data) {
                $result['success'] = true;            
                $result['message'] = 'User Account has been activated. You can now log back in and make sure to enter the valid credentials.';
                return $response->withStatus(200)->withJson($result);
            }
            $result['success'] = false;
            $result['message'] = 'User Account was not unblocked. Kindly check if the email is the latest or that the account was not yet unblocked.';
            return $response->withStatus(404)->withJson($result);
        }
        
        $result['success'] = false;
        $result['message'] = 'User Account was not unblocked. Kindly check if the email is the latest or that the account was not yet unblocked.';
        return $response->withStatus(404)->withJson($result);
    }

     /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $args
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function forgot_pw(Request $request, Response $response, $args)
    {
        $result             = [];
        $result['success']  = false;

        $request_data = $request->getParsedBody();

        /**
         * Validate input
         */
        if (empty($request_data['username'])) {
            $result['status'] = 'Invalid username/password';
            $result['message'] = 'User was not found. Kindly inform Connext Form Admin.';
            return $response->withStatus(404)->withJson($result);
        }

        $username = $request_data['username'];

        /**
         * Verify if user exists in users table before authenticating
         */
        $user = User::where('username', $username)->with('user_info')->first();
        if ($user) {
            $hash = hash('sha256', sha1(uniqid().time()) );
            $user->forgot_hash = $hash;
            $user->update();

            // send email notificaitons when user has been locked
            $receiver = [
                $user->user_info->last_name . ', ' . $user->user_info->first_name . ' ' . $user->user_info->middle_name,
                $user->user_info->email
            ];

            $notif = new CommonController($this->logger, $this->db, $this->settings);

            $notif->send_notification(
                'forgot_pw',
                $hash,
                $receiver
            );

            $result['success'] = true;
            $result['message'] = 'Please check your email to reset your password.';
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = 'User account was not found.';
        return $response->withStatus(404)->withJson($result);
    }

     /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $args
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function reset_pw(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = false;

        $request_data = $request->getParsedBody();

        $username = $request_data['username'];
        $hash = $request_data['hash'];
        $password = $request_data['password'];
        $vpassword = $request_data['vpassword'];

        if (empty($username) || empty($hash) || empty($password) || empty($vpassword)) {
            $result['status'] = 'Invalid username';
            // $result['message'] = 'User was not found. Kindly inform Connext Form Admin.';
            $result['message'] = 'Invalid input. Kindly check details to proceed with resetting your password.';
            return $response->withStatus(404)->withJson($result);
        }

        if ($password != $vpassword) {
            $result['status'] = 'Invalid password';
            $result['message'] = 'Password do not match. Please try again.';
            return $response->withStatus(404)->withJson($result);
        }

        $user = User::where('username', $username)->first();
        if ($user) {            
            $user->password = password_hash($password, PASSWORD_DEFAULT);
            $user->forgot_hash = null;
            $user->update();

            $result['status'] = 'Password changed!';
            $result['message'] = 'Password successfully changed. You can now login with the new password.';
            return $response->withStatus(404)->withJson($result);
        }

        $result['status'] = 'Invalid request';
        $result['message'] = 'User not found.';
        return $response->withStatus(404)->withJson($result);
    }

    /** Generate JWT Token here
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param Array $user
     * 
     * @return Array $data
     */
    private function _token ($request, $user, $expiration) {
        $now = new \DateTime();
        $future = new \DateTime("+{$expiration}");
        $server = $request->getServerParams();
        $jti = (new Base62)->encode(random_bytes(16));
        
        $sub = [];
        if ( !empty($user) ) {
            $sub['user'] = $user;
        }

        $payload = [
            "iat" => $now->getTimeStamp(),
            "exp" => $future->getTimeStamp(),
            "jti" => $jti,
            "sub" => $sub
        ];
        
        $token = JWT::encode($payload, $this->settings['jwt_secret'], "HS256");

        $data["token"] = $token;
        $data["expires"] = $future->getTimeStamp();

        return $data;
    }

    private function getRealIpAddress(){
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {  //check ip from share internet
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        }elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {  //to check ip is pass from proxy
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        }else{
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return $ip;
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