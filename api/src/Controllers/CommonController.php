<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;
use Curl\Curl;

/**
 * Models used for stats and other fetches
 */
use App\Models\User;
use App\Models\UserInfo;
use App\Models\Form;
use App\Models\Client;
use App\Models\Team;
use App\Models\LineOfBusiness;
use App\Models\FormTeam;
use App\Models\FormUser;
use App\Models\ClientUser;
use App\Models\LobUser;
use App\Models\TeamMember;
use App\Models\MailLog;
use App\Models\AppNotification;
use App\Models\AdminPrivilege;

/**LobUser
 * JWT required classes
 */
use Firebase\JWT\JWT;
use Tuupola\Base62;


class CommonController {
    private $db;
    private $logger;
    private $settings;
    private $token;

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db, $settings, $token = null) {
        $this->logger = $logger;
        $this->db = $db;
        $this->settings = $settings;
        $this->token = $token;
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_admin_dashboard(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = false;

        try {

            $data = [
                'user_active' =>      User::count(),
                'user_inactive' =>    User::onlyTrashed()->count(),
                'user_all' =>         User::withTrashed()->count(),
                'user_blocked' =>     User::where('login_attempt', 5)->count(),

                'user_admin' =>       User::where('is_admin', 1)->count(),
    
                'client_active' =>    Client::count(),
                'client_inactive' =>  Client::onlyTrashed()->count(),
                
                'lob_active' =>       LineOfBusiness::count(),
                'lob_inactive' =>     LineOfBusiness::onlyTrashed()->count(),
    
                'team_active' =>      Team::count(),
                'team_inactive' =>    Team::onlyTrashed()->count(),
                'team_all' =>         Team::withTrashed()->count()
            ];
    
            $result['success'] = true;
            $result['data'] = $data;
            return $response->withStatus(200)->withJson($result);

        } catch (Exception $e) {
            $result['message'] = 'Error. Connection error while fetching statistics.';
            return $response->withStatus(401)->withJson($result);
        }
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_user_client_dashboard(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = false;
        $clients = [];

        try {

            // get attribute user_id from middleware request modificaiton
            // $user_id = $request->getAttribute('user_id') !== null ? $request->getAttribute('user_id') : 0;
            $user_id = $this->token->sub->user->user->id;

            $user = User::find($user_id);
            if (!$user) {
                $result['message'] = 'Forbidden. User not found.';
                return $response->withStatus(401)->withJson($result);
            }

            // check if user is admin, then return all clients
            if ($this->token->sub->user->user->is_admin) {
                $clients = Client::orderBy('client_name')->get();

                $result['success'] = true;
                $result['count'] = count($clients);
                $result['data'] = $clients;
                return $response->withStatus(200)->withJson($result);
            }
            
            // get all teams a user is a member of
            $teams = TeamMember::select('team_id')
                               ->distinct('team_id')
                               ->where('user_id', $user_id)
                               ->pluck('team_id')
                               ->toArray();

            // get all clients from form_team table (team permissions)
            $user_teams = FormTeam::whereIn('team_id', $teams)
                                  ->distinct('client_id')
                                  ->with('client')
                                  ->has('client')
                                  ->get()
                                  ->toArray();

            $team_form_clients = [];
            foreach ($user_teams as $form) {
                if(!in_array($form['client'], $clients)) {
                    $team_form_clients[] = $form['client'];
                }
            }

            // get all clients from form_user table (user permissions)
            $user_forms = FormUser::where('user_id', $user_id)
                                  ->with('client')
                                  ->has('client')
                                  ->get()
                                  ->toArray();

            $user_form_clients = [];
            foreach ($user_forms as $form) {
                if(!in_array($form['client'], $clients)) {
                    $user_form_clients[] = $form['client'];
                }
            }

            // get all clients where user is admin (client permission)
            $user_clients = ClientUser::where('user_id', $user_id)
                                      ->with('client')
                                      ->has('client')
                                      ->get()
                                      ->toArray();

            $user_client_clients = [];
            foreach ($user_clients as $user_client) {
                if(!in_array($user_client['client'], $clients)) {
                    $user_client_clients[] = $user_client['client'];
                }
            }

            // get clients from user lob permissions
            $user_lobs = LobUser::where('user_id', $user_id)
                                ->with('client')
                                ->has('client')
                                ->get()
                                ->toArray();

            $user_lob_clients = [];
            foreach ($user_lobs as $user_lob) {
                if(!in_array($user_lob['client'], $clients)) {
                    $user_lob_clients[] = $user_lob['client'];
                }
            }

            $merged = array_unique(array_merge($user_client_clients, $user_form_clients, $user_lob_clients, $team_form_clients), SORT_REGULAR);

            usort($merged, function ($a, $b) {
                return $a['client_name'] <=> $b['client_name'];
            });

            $clients = array_merge($merged, array());

            $result['success'] = true;
            $result['count'] = count($clients);
            $result['data'] = $clients;
            return $response->withStatus(200)->withJson($result);
        } catch (Exception $e) {
            $result['message'] = 'Error. Connection error while fetching statistics.';
            return $response->withStatus(401)->withJson($result);
        }
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_user_form_dashboard(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = false;
        $lobs = [];

        try {

            $user_id = $this->token->sub->user->user->id;
            $client_id = $params['client_id'];

            // valdiate user
            $user = User::find($user_id);
            if (!$user) {
                $result['message'] = 'Forbidden. User not found.';
                return $response->withStatus(401)->withJson($result);
            }

            // validate client
            $client = Client::find($client_id);
            if (!$client) {
                $result['message'] = 'Forbidden. Client not found.';
                return $response->withStatus(401)->withJson($result);
            }

            // check if user is admin, then return all clients
            if ($this->token->sub->user->user->is_admin) {

                $admin_privilege = AdminPrivilege::where('user_id', $user_id);

                if (!$admin_privilege) {
                    $result['message'] = 'Forbidden. User has no admin access.';
                    return $response->withStatus(401)->withJson($result);
                }
                
                $lobs = LineOfBusiness::with('forms')
                                      ->where('client_id', $client_id)
                                      ->with('client')
                                      ->get();

                $result['success'] = true;
                $result['count'] = count($lobs);
                $result['data'] = $lobs;

                return $response->withStatus(200)->withJson($result);
            }

            // get cLient admin first
            $user_client = ClientUser::where('user_id', $user_id)
                                       ->where('client_id', $client_id)
                                       ->with('client')
                                       ->get()
                                       ->toArray();

            // if client admin, show al forms and lobs then return
            if ($user_client) {
                $lobs = LineOfBusiness::with('forms')
                                      ->where('client_id', $client_id)
                                      ->with('client')
                                      ->get();

                $result['success'] = true;
                $result['user_type'] = 'client admin';
                $result['count'] = count($lobs);
                $result['data'] = $lobs;

                return $response->withStatus(200)->withJson($result);
            }

            /**
             * On the next block, 
             * get all permissions for the User for current Client
             * 
             * include permissions:
             *  LOB User
             *  Form User
             *  Form Team
             */

            $_lobs = [];

            //  **************** GET ALL LOBs from LOB USER PERMISSIONS ***************
            $_lob_users = LobUser::where('user_id', $user_id)
                                 ->where('client_id', $client_id)
                                 ->pluck('lob_id')
                                 ->toArray();

            // get lobs including forms
            $user_lobs = LineOfBusiness::whereIn('id', $_lob_users)
                                    ->with('forms')
                                    ->with('client')
                                    ->get()
                                    ->toArray();

            // store lobs with or w/o forms to _lobs array
            $_lobs = $user_lobs;

            // ***************** GET ALL LOBs thru FORM USER PERMISSIONS **************
            // get distinct lines of business from Form Users
            $user_forms_lobs = FormUser::select('lob_id')
                                  ->where('user_id', $user_id)
                                  ->where('client_id', $client_id)
                                  ->groupBy('lob_id')
                                  ->with('lob.client')
                                  ->has('lob')
                                  ->get()
                                  ->toArray();

            foreach ($user_forms_lobs as $lob) {
                $_lobs[] = $lob['lob'];
            }

            // ******************* GET ALL LOBs thru FORM TEAM PERMISSION *************
            // get all distinct teams a user is a member of
            $teams = TeamMember::select('team_id')
                               ->distinct('team_id')
                               ->where('user_id', $user_id)
                               ->pluck('team_id')
                               ->toArray();

            // get distinct lines of business from Form Teams
            $team_forms_lobs = FormTeam::select('lob_id')
                                       ->whereIn('team_id', $teams)
                                       ->where('client_id', $client_id)
                                       ->groupBy('lob_id')
                                       ->with('lob.client')
                                       ->has('lob')
                                       ->get()
                                       ->toArray();
            
            foreach ($team_forms_lobs as $lob) {
                if (!in_array($lob['lob'], $_lobs)) {
                    $_lobs[] = $lob['lob'];
                }
            }

            // arrange lobs and forms - add them to $_lobs array
            $f_lobs = [];
            foreach ($_lobs as $lob) {

                // check if lob is already existing in the array stack
                // do not add if existing
                if (in_array($lob['id'], $_lob_users)) {
                    $is_existing = false;

                    foreach($f_lobs as $flob) {
                        if ($flob['id'] == $lob['id']) {
                            $is_existing = true;
                        }
                    }

                    if (!$is_existing) {
                        $f_lobs[] = $lob;
                    }

                    continue;
                }

                // get all form_user permission for each lob_id
                $lob_forms_user = FormUser::select('form_id')
                                    ->where('user_id', $user_id)
                                    ->where('client_id', $client_id)
                                    ->where('lob_id', $lob['id'])
                                    ->with('form.creator')
                                    ->has('form')
                                    ->get()
                                    ->toArray();

                // get all form_team permission for each lob_id
                $lob_forms_team = FormTeam::select('form_id')
                                    ->whereIn('team_id', $teams)
                                    ->where('client_id', $client_id)
                                    ->where('lob_id', $lob['id'])
                                    ->with('form.creator')
                                    ->has('form')
                                    ->get()
                                    ->toArray();

                // append all forms found on form_user to the current lob
                foreach ($lob_forms_user as $form) {
                    if (!isset($lob['forms']) || !in_array($form['form'], $lob['forms'])) {
                        $lob['forms'][] = $form['form'];
                    }
                }

                // append all forms found on form_team to the current lob
                foreach ($lob_forms_team as $form) {
                    if (!isset($lob['forms']) || !in_array($form['form'], $lob['forms'])) {
                        $lob['forms'][] = $form['form'];
                    }
                }

                // store to $_lobs array variable
                $f_lobs[] = $lob;
            }

            $result['success'] = true;
            $result['count'] = count($f_lobs);
            $result['data'] = $f_lobs;

            return $response->withStatus(200)->withJson($result);

        } catch (Exception $e) {
            $result['message'] = 'Error. Connection error while fetching statistics.';
            return $response->withStatus(401)->withJson($result);
        }
    }
    
    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_user_dashboard(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = false;

        try {

            // get attribute user_id from middleware request modificaiton
            $user_id = $request->getAttribute('user_id') !== null ? $request->getAttribute('user_id') : 0;

            $user = User::find($user_id);
            if (!$user) {
                $result['message'] = 'Forbidden. User not found.';
                return $response->withStatus(401)->withJson($result);
            }

            // get all forms from form_user table (user permissions)
            $user_forms = FormUser::select('form_id')
                                    ->where('user_id', $user_id)
                                    ->with('form')
                                    ->with('form.creator')
                                    ->has('form')
                                    ->with('form.lob.client:id,client_name')
                                    ->get()
                                    ->toArray();

            // get all forms from form_team table (team permissions)
            $teams = TeamMember::select('team_id')->distinct('team_id')->where('user_id', $user_id)->get();
            $team_forms = FormTeam::select('form_id')
                                    ->distinct('form_id')
                                    ->whereIn('team_id', $teams)
                                    ->with('form')
                                    ->with('form.creator')
                                    ->has('form')
                                    ->with('form.lob.client:id,client_name')
                                    ->get()->toArray();

            // $data = array_merge($team_forms, $user_forms);
            $merged = array_unique(array_merge($team_forms, $user_forms), SORT_REGULAR);

            // convert data from object to array
            $data = array_merge($merged, array());

            $result['success'] = true;
            $result['data'] = $data;
            return $response->withStatus(200)->withJson($result);

        } catch (Exception $e) {
            $result['message'] = 'Error. Connection error while fetching statistics.';
            return $response->withStatus(401)->withJson($result);
        }
    }

    /**
     * A GLOBAL function which validates an argument existence & contents
     * 
     * @param $arg - any single variable to check
     * @param $array - an array, if defined, will be searched
     * @param $index - list of keys check against $array
     * 
     * @return boolean true|false 
     * 
     */
    public static function validate($arg, Array $array=null, Array $indices=null) {
        if (isset($array)) {
            foreach ($indices as $index) {
                if (!array_key_exists($index, $array))
                    return false;
                if (empty(trim($array[$index])) || is_null(trim($array[$index])) || trim($array[$index] == ''))
                    return false;
            }
            return true;
        }

        if (isset($arg)) {
            if (!empty($arg) || !is_null($arg)) 
                return true;
        }
        return false;
    }

    /**
     * Route for creating JWT API Token
     * This route can be executed in terminal or Postman.
     * 
     * curl "http://hrbotapi.cloudstaff.com/token" \
     * --request POST \
     * --include \
     * --insecure \
     * --header "Content-Type: application/json" \
     * --data '{"domain": "http://localhost/"}' \
     * --user michaell
     * 
     * Then enter password on prompt.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     * 
     */
    public function token($request, $response, $params) {
        // whitelist creation of token to trusted domain names only
        $whitelist = $this->settings['allowed_addresses'];
    
        $server = $request->getServerParams();
    
        if (!in_array($server['REMOTE_ADDR'], $whitelist)) {
            $data["success"] = false;
            $data["message"] = "Forbidden. Invalid credentials.";
        
            return $response->withStatus(401)
                ->withHeader("Content-Type", "application/json")
                ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
        }
        
        $now = new \DateTime();
        // $future = new DateTime("now +7 days");       // Uncomment for expiring tokens
        $server = $request->getServerParams();
        $req_data = $request->getParsedBody();
    
        $jti = (new Base62)->encode(random_bytes(16));
    
        $payload = [
            "iat" => $now->getTimeStamp(),
            // "exp" => $future->getTimeStamp(),        // Uncomment for expiring tokens
            "jti" => $jti,
            "sub" => $server["PHP_AUTH_USER"],
            // "domain" => $req_data["domain"]          // Include some optional contents
        ];
    
        $secret = $this->settings['jwt_secret'];
        $token = JWT::encode($payload, $secret, "HS256");
    
        $data['success'] = true;
        $data["token"] = $token;
        // $data["expires"] = $future->getTimeStamp();
    
        return $response->withStatus(201)
            ->withHeader("Content-Type", "application/json")
            ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }

    /**
     * Send Email Notification WHEN:
     *      USER was TAGGED
     *      PERMISSION was given to USER
     *      USER LOGIN LOCKED
     * 
     * Send/Create In-App Notification (web)
     * 
     * @param integer   $form_id
     * @param string    $type
     * @param string    $link
     * @param array     $receiver - Users emails to send notifications
     * 
     * @return boolean  true|false
     */
    public function send_notification($type, $link, $receiver, $form_id = null, $record_id = 0) {

        $sender = [
            $this->settings['qagold_email_sender']['name'],
            $this->settings['qagold_email_sender']['email']
        ];

        $custom = [
            'cc' => [],
            'bcc' => []
        ];

        if ($type == 'tag') {

            $form = Form::find($form_id);

            /** ************************************* **/
            /**       USER TAG NOTIFICATION           **/
            /** ************************************* **/
            $subject = "User Tagged Notification (" . $form['form_name'] . ")";
            $user = UserInfo::where('email', $receiver[1])->first();

            $file = __DIR__ . '/../Templates/tagged.html';
            $body = file_get_contents($file, FILE_USE_INCLUDE_PATH);

            // generate a unique hash for each user notification for checking on is_opened
            $hash = hash('sha256', sha1(uniqid().time()));
            $full_link = $this->settings['qagold_link'] . $link . '/' . $hash;

            // change the QA Gold Address for logo/icons
            $body = str_replace("{{ qagold_link }}", $this->settings['qagold_link'], $body);

            // change the body greeting
            $body = str_replace("{{ user_name }}", $user->username . '! <p style="font-size: 10px; color: gray;">' . $user->first_name . ' ' . $user->last_name . '</p>', $body);

            // change the link based on the record view link
            $body = str_replace("{{ link_to_open }}", $full_link, $body);

            // add the form title/name to the message.
            $body = str_replace("{{ form_name }}", $form['form_name'], $body);

            DB::beginTransaction();
            try {

                /** ************************************* **/
                /**       BEGIN EMAIL NOTIFICATION        **/
                /** ************************************* **/
                $email_nofif = MailLog::create(
                    [
                        'user_id'       => $user->user_id,
                        'receiver'      => json_encode($receiver),
                        'sender'        => json_encode($sender),
                        'subject'       => $subject,
                        'custom'        => json_encode($custom),
                        'body'          => $body,
                        'link'          => $full_link,
                        'hash'          => $hash
                    ]
                );
    
                /** ************************************* **/
                /**      BEGIN IN APP NOTIFICATION        **/
                /** ************************************* **/
                $label = 'You have been tagged on an item in ' . $form['form_name'] . '.';
                $app_notif = AppNotification::create(
                    [
                        'user_id'       => $user['user_id'],
                        'link'          => $link . '/' . $hash,
                        'hash'          => $hash,
                        'label'         => $label,
                        'form_id'       => $form['id'],
                        'record_id'     => $record_id,
                        'type'          => $type,
                        'icon'          => 'tag'
                    ]
                );
    
                DB::commit();
                return true;

            } catch (Exception $e) {

                DB::rollBack();
                return false;
            }

        } elseif ($type == 'permission') {

            /** PERMISSION GRANTED NOTIFICATION */
            $subject = "Permission Notification [QA Gold]";

        } elseif ($type == 'user_locked') {

            /** ************************************* **/
            /**       USER LOCKED NTOFICATION         **/
            /** ************************************* **/

            $subject = "User Acount Locked [QA Gold]";
            $user = UserInfo::where('email', $receiver[1])->first();

            $full_link = $this->settings['qagold_link'] . '/login/unblock/' . $user->username  . '/' . $link;

            $file = __DIR__ . '/../Templates/locked.html';
            $body = file_get_contents($file, FILE_USE_INCLUDE_PATH);

            // change the QA Gold Address for logo/icons
            $body = str_replace("{{ qagold_link }}", $this->settings['qagold_link'], $body);

            // change the body greeting
            $body = str_replace("{{ user_name }}", $user->username . '! <p style="font-size: 10px; color: gray;">' . $user->first_name . ' ' . $user->last_name . '</p>', $body);

            // change the link based on the record view link
            $body = str_replace("{{ link_to_open }}", $full_link, $body);

            /** ************************************* **/
            /**       BEGIN EMAIL NOTIFICATION        **/
            /** ************************************* **/
            $email_nofif = MailLog::create(
                [
                    'user_id'       => $user->user_id,
                    'receiver'      => json_encode($receiver),
                    'sender'        => json_encode($sender),
                    'subject'       => $subject,
                    'custom'        => json_encode($custom),
                    'body'          => $body,
                    'link'          => $full_link,
                    'hash'          => $link
                ]
            );

        } else {

            /** ANY OTHER EMAIL NOTIFICATION */
            $subject = "General Notification [QA Gold]";

        }

       

    }
}
