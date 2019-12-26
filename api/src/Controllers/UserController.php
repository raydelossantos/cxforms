<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;
use Slim\Http\UploadedFile as UploadedFile;

use App\Models\User;
use App\Models\AdminPrivilege;
use App\Models\UserInfo;
use App\Models\FormUser;
use App\Controllers\CommonController;
use App\Models\AppNotification;
use App\Models\ClientUser;
use App\Models\LobUser;

class UserController {
    private $db;
    private $logger;
    private $settings;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. User has been created.';
    const SUCCESS_UPDATE = 'Success. User has been updated.';
    const SUCCESS_DELETE = 'Success, User has been deleted.';
    const SUCCESS_RESTORE = 'Success, User has been restored.';
    const ERROR_SAVE = 'Error. User was not saved.';
    const ERROR_UPDATE = 'Error. User was not updated.';
    const ERROR_EXIST = 'Forbidden. User already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_UPDATE_NOT_EXIST = 'Forbidden. You are updating User that does not exists.';
    const ERROR_RESTORE_NOT_EXISTS = 'Forbidden. You are restoring User that does not exists.';
    const ERROR_DELETE_NOT_EXIST = 'Forbidden. You are deleting User that does not exists.';    
    const ERROR_SAVING = 'Error. Something went wrong while saving User.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting User.';
    const ERROR_RESOTRE = 'Error. Something went wrong while restoring User.';
    const ERROR_NOT_FOUND = 'Error. No record found %s';
    const ERROR_INVALID_PASSWORD = "Error. Password should contain: %s";
   

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db, $settings) {
        $this->logger = $logger;
        $this->db = $db;
        $this->settings = $settings;
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function user_info(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if (!empty($query) ) {
            $res = User::where($query)->with('user_info')->has('user_info')->get();
        } else {
            $res = User::with('user_info')->has('user_info')->get();
        }

        if (!empty($res) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $res->count();
            $result['data'] = $res;
            return $response->withStatus(200)->withJson($result);
        }

        return $response->withStatus(404)->withJson($result);
    }

    /**
     * Function displayin gall users with invalid logins
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function invalid(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $res = User::where('login_attempt', '>=', 1)->with('user_info')->get();

        if (!empty($res) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $res->count();
            $result['data'] = $res;
            return $response->withStatus(200)->withJson($result);
        }

        return $response->withStatus(404)->withJson($result);
    }

    /**
     * Deleted Users
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function deleted_users(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if (!empty($query) ) {
            $res = User::onlyTrashed()->where($query)->with('user_info')->get();
        } else {
            $res = User::onlyTrashed()->with('user_info')->get();
        }

        if (!empty($res) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $res->count();
            $result['data'] = $res;
            return $response->withStatus(200)->withJson($result);
        }

        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_all(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if (!empty($query) ) {
            $res = User::where($query)->get();
        } else {
            $res = User::all();
        }

        if (!empty($res) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $res->count();
            $result['data'] = $res;
            return $response->withStatus(200)->withJson($result);
        }

        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_all_user_not_in_form(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $res = FormUser::select('user_id')->where('form_id', $params['id'])->get()->toArray();

        if (count($res) > 0) {
            $users = User::whereNotIn('id', $res)->with('user_info')->has('user_info')->get();
        } else {
            $users = User::with('user_info')->has('user_info')->get();
        }

        if ($users) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $users->count();
            $result['data'] = $users;
            return $response->withStatus(200)->withJson($result);
        }

        $return['message'] = "Unable to fetch data. Please try again.";
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_all_user_not_in_client(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $res = ClientUser::select('user_id')->where('client_id', $params['id'])->get()->toArray();

        if (count($res) > 0) {
            $users = User::whereNotIn('id', $res)->with('user_info')->has('user_info')->orderBy('username')->get();
        } else {
            $users = User::with('user_info')->has('user_info')->get();
        }

        if ($users) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $users->count();
            $result['data'] = $users;
            return $response->withStatus(200)->withJson($result);
        }

        $return['message'] = "Unable to fetch data. Please try again.";
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_all_user_not_in_lob(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $res = LobUser::select('user_id')->where('lob_id', $params['id'])->get()->toArray();

        if (count($res) > 0) {
            $users = User::whereNotIn('id', $res)->with('user_info')->has('user_info')->orderBy('username')->get();
        } else {
            $users = User::with('user_info')->has('user_info')->get();
        }

        if ($users) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $users->count();
            $result['data'] = $users;
            return $response->withStatus(200)->withJson($result);
        }

        $return['message'] = "Unable to fetch data. Please try again.";
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $search = User::where('id', $params['id'])->with('user_info')->with('creator')->first();

        if (!empty($search) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $search->count();
            $result['data'] = $search;
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = self::ERROR_NOT_FOUND;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function create(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['username', 'first_name', 'last_name'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }
        
        // Search for existing word before processing/saving
        $search_criteria = 'username';
        $search = User::where($search_criteria, '=', $request_data[$search_criteria])->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
            return $response->withStatus(403)->withJson($result); 
        }

        // Save the record
        $data = User::create(array_map('trim', $request_data));
        if ($data) {
            $result['success'] = self::SUCCESS;
            $result['message'] = self::SUCCESS_CREATE;
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = self::ERROR_SAVING;
        return $response->withStatus(403)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function update(Request $request, Response $response, $params){
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['username', 'id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        // Search for existing word before processing/saving
        $search_criteria = 'username';
        $search = User::where($search_criteria, $request_data[$search_criteria])->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0 && $search->id != $params['id']) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
            return $response->withStatus(403)->withJson($result); 
        }

        // Update record
        $user = User::find($params['id']);
        $user_info = UserInfo::where('username', $request_data['username'])
                                ->where('user_id', $request_data['id'])
                                ->first();

        if ($user && $user_info) {

            $update_fields = [
                'first_name'    => $request_data['first_name'],
                'middle_name'   => $request_data['middle_name'],
                'last_name'     => $request_data['last_name'],
            ];

            
            if (isset($request_data['email'])) $update_fields['email'] = $request_data['email'];

            $data = $user_info->update(array_map('trim', $update_fields));

            if ($data) {
                $result['success'] = self::SUCCESS;
                $result['message'] = self::SUCCESS_UPDATE;
                return $response->withStatus(200)->withJson($result);
            }

            $result['message'] = self::ERROR_SAVING;
            return $response->withStatus(403)->withJson($result);
        }

        $result['message'] = self::ERROR_UPDATE_NOT_EXIST;
        return $response->withStatus(403)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function delete(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $user = User::find($params['id']);
        if ($user) {
            $data = $user->delete();
            
            if ($data) {
                $result['success'] = self::SUCCESS;            
                $result['data'] = self::SUCCESS_DELETE;
                return $response->withStatus(200)->withJson($result);
            }
            $result['success'] = self::ERROR;
            $result['message'] = self::ERROR_DELETE;
            return $response->withStatus(404)->withJson($result);
        }
        
        $result['success'] = self::ERROR;
        $result['message'] = self::ERROR_DELETE_NOT_EXIST;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * Function to restore deleted user
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function restore(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();

        $user = User::onlyTrashed()->find($request_data['id']);
        if ($user) {
            $data = $user->restore();
            
            if ($data) {
                $result['success'] = self::SUCCESS;            
                $result['data'] = self::SUCCESS_RESTORE;
                return $response->withStatus(200)->withJson($result);
            }
            $result['success'] = self::ERROR;
            $result['message'] = self::ERROR_RESOTRE;
            return $response->withStatus(404)->withJson($result);
        }
        
        $result['success'] = self::ERROR;
        $result['message'] = self::ERROR_RESTORE_NOT_EXISTS;
        return $response->withStatus(404)->withJson($result);
    }
    
    /**
     * Function to unblock user set login attempt to 0
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function unblock(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();

        $user = User::where('id', $request_data['id'])->where('login_attempt', '>', 0)->first();
        if ($user) {
            $user->login_attempt = 0;
            $user->reset_hash = null;
            $data = $user->save();
            
            if ($data) {
                $result['success'] = self::SUCCESS;            
                $result['data'] = self::SUCCESS_RESTORE;
                return $response->withStatus(200)->withJson($result);
            }
            $result['success'] = self::ERROR;
            $result['message'] = self::ERROR_RESOTRE;
            return $response->withStatus(404)->withJson($result);
        }
        
        $result['success'] = self::ERROR;
        $result['message'] = self::ERROR_RESTORE_NOT_EXISTS;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * Update User on login failure
     * TEMPORARY ONLY
     */
    public function update_login(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        $user = User::where('username', $request_data['username'])->first();
        if ($user) {
            $pass_check = ($request_data['password'] == $user->password) ? true : false;
            if (!$pass_check) {
                // update user login details
                $user->login_attempt = (int) $user->login_attempt + 1;
                if (!$user->login_attempt < $this->settings['login']['max_attempt']) {
                    $user->status = 0;
                }
                $user->save();
            }
        }
    }

    /**
     * Password validation
     * @param string $password
     * 
     * @return array $result
     * TEMPORARY ONLY
     */
    private function password_validation($password) {
        $result = [];
        $result['success'] = false;
        $result['message'] = [];

        // minimum password characters 10
        if (strlen(trim($password)) <= 9) {
            $result['message'][] = 'at least 10 characters.';
        }

        // contains at least 1 capital letter
        $uppercase = preg_match('@[A-Z]@', $password);
        if (!$uppercase) {
            $result['message'][] = 'an upper case letter.';
        }

        // contains at least 1 special character
        $special = preg_match('/[\'\/~`\!@#\$%\^&\*\(\)_\-\+=\{\}\[\]\|;:"\<\>,\.\?\\\]/', $password);

        if (!$special) {
            $result['message'][] = 'a special character.';
        }

        // contains at least 1 small cap letter
        $lowercase = preg_match('@[a-z]@', $password);
        if (!$lowercase) {
            $result['message'][] = 'a lower case letter.';        
        }

        // contains at least 1 numeric character
        $number = preg_match('@[0-9]@', $password);
        if (!$number) {
            $result['message'][] = 'a numeric character.';        
        }

        if (count($result['message']) > 0) {
            return $result;
        }

        $result['success'] = true;
        return $result;
    }

    /**
     * CREATE SINGLE USER & USER INFO (Manuall Add for non-CS staffs)
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function create_user(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['username', 'password', 'first_name', 'last_name','middle_name', 'email'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }
        
        // Search for existing word before processing/saving
        $search_criteria = 'username';
        $search = User::where($search_criteria, '=', $request_data[$search_criteria])->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
            return $response->withStatus(403)->withJson($result); 
        }

        // another validation for CS-Employee ID
        if (isset($request_data['employee_id'])) {
            $search_criteria = 'employee_id';
            $search = UserInfo::where($search_criteria, '=', $request_data[$search_criteria])->first();

            if (count($search) > 0) {
                $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
                return $response->withStatus(403)->withJson($result); 
            }
        }

        // another validation for EMAIL (shoudl be unique)
        if (isset($request_data['email'])) {
            $search_criteria = 'email';
            $search = UserInfo::where($search_criteria, '=', $request_data[$search_criteria])->first();

            if (count($search) > 0) {
                $result['message'] = 'Forbidden. Email already exists [' . $request_data[$search_criteria] . ']';
                return $response->withStatus(403)->withJson($result); 
            }
        }

        // begin database transaction here
        DB::beginTransaction();

        try {

            $user_data = [
                'username'          => $request_data['username'],
                'created_by'        => $request_data['created_by']
            ];

            $new_user = User::create(array_map('trim', $user_data));

            if ($new_user) {

                $user_info_data = [
                    'username'          => $request_data['username'],
                    'password'          => password_hash($request-date['password'], PASSWORD_BCRYPT),
                    'user_origin'       => 0,
                    'user_id'           => $new_user->id,
                    'employee_id'       => 0,
                    'first_name'        => $request_data['first_name'],
                    'last_name'         => $request_data['last_name'],
                    'middle_name'       => (isset($request_data['middle_name'])) ? $request_data['middle_name'] : '',
                    'email'        => $request_data['email']
                ];
    
                $new_user_info = UserInfo::create(array_map('trim', $user_info_data));
                                        
                if (!$new_user || !$new_user_info) {
                    DB::rollBack();
                }
            }

            DB::commit();
            
            $result['success'] = self::SUCCESS;
            $result['message'] = self::SUCCESS_CREATE;

            return $response->withStatus(200)->withJson($result);

        } catch (Exception $e) {
            DB::rollBack();
        }

        $result['message'] = self::ERROR_SAVING;
        return $response->withStatus(403)->withJson($result);
    }

    /**
     * CREATE USER & USER FROM CS API
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function create_batch(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();

        // Connect to CIB API
        $url = $this->settings['api']['cib_api_url'] . 'api/token.json';
        $params = [
            'app_id'    => $this->settings['api']['app_id'],
            'app_key'   => $this->settings['api']['app_key']
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $api_token = json_decode(curl_exec($ch), true);

        $token = 'Bearer ' . $api_token['token'];

        $url = $this->settings['api']['cib_api_url'] . 'api/lists.json';
        $params = [];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Authorization: ' . $token));
        $api_records = json_decode(curl_exec($ch), true);

        // var_dump($api_records);
        if ($api_records['message'] != 'Records found') {

            // error in connection
            $result['message'] = 'API Connection error: ' . $api_records['message'] . ' | code: ' . $api_records['code'];
            return $response->withStatus(403)->withJson($result);

        } else if ($api_records && $api_records['status'] == 'Success') {
            
            while(true) {
                // $this->logger->info(count($api_records['data']));
                // $this->logger->info(print_r($api_records,true));

                if (count($api_records['data']) == 0) {
                    // $this->logger->info(print_r($api_records,true));
                    // $this->logger->info('no more data to process. exiting sync...');
                    break;
                }

                foreach ($api_records['data'] as $record) {

                    // validation for Employee ID check if exists
                    $search_criteria = 'employee_id';
                    $search = UserInfo::where($search_criteria, '=', $record[$search_criteria])->first();
                    if ($search) {

                        // UPDATE RECORD HERE
                        continue;

                    } else {

                        $email = $record['username'];
                        $username = substr($record['username'], 0, strpos($record['username'], "@"));

                        $search = User::where('username', $username)->withTrashed()->first();
                        if ($search) {
                            // Username was added manually
                            continue;
                        }
                        
                        if ($username == '' || empty($username)) {
                            continue;
                        }

                        $_user = [
                            'username'          => $username,
                            'created_by'        => 0                        // created by sync
                        ];

                        $user = User::create(array_map('trim', $_user));
                        if ($user) {

                            $_user_info = [
                                'username'          => $username,
                                'email'             => $email,
                                'user_origin'       => 1,                       // SET User Origin to 1 for CS API source
                                'user_id'           => $user->id,
                                'employee_id'       => $record['employee_id'],
                                'first_name'        => ucwords($record['firstname']),
                                'last_name'         => ucwords($record['lastname']),
                                'middle_name'       => ucwords($record['middlename']),
                            ];

                            // Save User Info record
                            $user_info = UserInfo::create(array_map('trim', $_user_info));
                            if ($user_info) {
                            }
                        }
                    }
                }

                // // Connect to CIB API AGAIN
                $next_page = (int)$api_records['pagination']['page'] + 1;
                $params = ['page' => $next_page];

                // $this->logger->info($next_page);

                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
                curl_setopt($ch, CURLOPT_VERBOSE, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Authorization: ' . $token));
                $api_records = json_decode(curl_exec($ch), true);
            }

            $result['success'] = self::SUCCESS;
            $result['message'] = 'Success. API Sync was successfully processed.';
            return $response->withStatus(200)->withJson($result);
        }
        
        $result['message'] = self::ERROR_SAVING;
        return $response->withStatus(403)->withJson($result);
    }

    //****************************************************************/
    /************************** ADMIN USERS **************************/
    //****************************************************************/

    /**
     * CREATE ADMIN (update User record + create Admin Privilege)
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function admin_create(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['username', 'user_id', 'display_name'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        $user = User::find($request_data['user_id']);

        // If record exists, throw an error and abort saving
        if (!$user) {
            $result['message'] = sprintf(self::ERROR_NOT_FOUND, $request_data['user_id']);
            return $response->withStatus(403)->withJson($result); 
        }

        if ($user->is_admin == 1) {

            $result['message'] = 'User ID: ' . $request_data['user_id'] . ' is already a System Admin.';
            return $response->withStatus(403)->withJson($result); 

        } else {

            // begin database transaction here
            DB::beginTransaction();

            $user->is_admin = 1;
            $user->save();

            // Create new Admin Privilege
            $admin_privilege = [
                'username'          => $request_data['username'],
                'user_id'           => $request_data['user_id'],
                'display_name'      => $request_data['display_name'],
                'manage_admins'     => $request_data['manage_admins'],
                'manage_clients'    => $request_data['manage_clients'],
                'manage_teams'      => $request_data['manage_teams'],
                'manage_users'      => $request_data['manage_users'],
                'manage_lob'        => $request_data['manage_lob'],
                'manage_forms'      => $request_data['manage_forms']
            ];

            $search = AdminPrivilege::where('username', $request_data['username'])->whereOr('user_id', $request_data['user_id'])->first();

            if ($search) {
                $result['success'] = false;
                $result['message'] = 'Error. An Admin Privilege already exist for User ID ' . $request_data['user_id'] . ') or Username.' . $request_data['username'];
                return $response->withStatus(200)->withJson($result);
            }

            // Save AdminPrivilege record
            $admin = AdminPrivilege::create($admin_privilege);

            if ($admin) {

                /** ************************************* **/
                /**      BEGIN IN APP NOTIFICATION        **/
                /** ************************************* **/
                $app_notif = AppNotification::create(
                    [
                        'user_id'       => $user->id,
                        'link'          => '',
                        'hash'          => null,
                        'label'         => 'Admin privileges granted.',
                        'form_id'       => 0,
                        'type'          => 'admin',
                        'icon'          => 'user-md'
                    ]
                );

                // commit changes to DB
                DB::commit();

                $result['success'] = self::SUCCESS;
                $result['message'] = self::SUCCESS_CREATE;
                return $response->withStatus(200)->withJson($result);
            }

            DB:: rollBack();
        }

        $result['message'] = self::ERROR_SAVING;
        return $response->withStatus(403)->withJson($result);
    }

    /**
     * DELETE ADMIN & Admin Privileges
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function admin_delete(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $user = User::find($params['id']);

        if ($user && $user->is_admin == 0) {
            $result['success'] = self::ERROR;
            $result['message'] = self::ERROR_DELETE_NOT_EXIST;
            return $response->withStatus(404)->withJson($result);
        }

        if ($user) {
            $user->is_admin = 0;
            $data = $user->update();

            $admin_privilege = AdminPrivilege::where('user_id', $params['id'])->delete();
            
            if ($data && $admin_privilege) {
                $result['success'] = self::SUCCESS;            
                $result['data'] = self::SUCCESS_DELETE;
                return $response->withStatus(200)->withJson($result);
            }
            $result['success'] = self::ERROR;
            $result['message'] = self::ERROR_DELETE;
            return $response->withStatus(404)->withJson($result);
        }
        
        $result['success'] = self::ERROR;
        $result['message'] = self::ERROR_DELETE_NOT_EXIST;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * GET ALL ADMIN USERS with  USER INFO
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function admin_info(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if (!empty($query) ) {
            $res = User::where($query)
                ->where('is_admin', 1)
                ->with('user_info')
                ->with('privilege')
                ->get();
        } else {
            $res = User::where('is_admin', 1)
                ->with('user_info')
                ->with('privilege')
                ->get();
        }

        if (!empty($res) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $res->count();
            $result['data'] = $res;
            return $response->withStatus(200)->withJson($result);
        }

        return $response->withStatus(404)->withJson($result);
    }

    /**
     * GET  ADMIN USER with  USER INFO BY ID
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function admin_get(Request $request, Response $response, $params) {

        $result = [];
        $result['success'] = self::ERROR;

        $search = User::where('id', $params['id'])
                        ->where('is_admin', 1)
                        ->with('user_info')
                        ->with('creator')
                        ->with('privilege')
                        ->first();

        if (!empty($search) ) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $search->count();
            $result['data'] = $search;
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = self::ERROR_NOT_FOUND;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function admin_update(Request $request, Response $response, $params){
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['display_name'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        // Update record
        $admin_privilege = AdminPrivilege::where('user_id', $params['id'])->first();

        if ($admin_privilege) {

            $data = $admin_privilege->update($request_data);

            if ($data) {
                $result['success'] = self::SUCCESS;
                $result['message'] = self::SUCCESS_UPDATE;
                return $response->withStatus(200)->withJson($result);
            }

            $result['message'] = self::ERROR_SAVING;
            return $response->withStatus(403)->withJson($result);
        }

        $result['message'] = self::ERROR_UPDATE_NOT_EXIST;
        return $response->withStatus(403)->withJson($result);
    }

    /**
     * IMPORTING A CSV FILE 
     *
     * @param $request (consist of a CSV FILE)
     * @param $response
     * @param $params
     *
     * @return Array $result
     */
    public function import_csv(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;
        $result['message'] = 'Forbidden. You may not have access to this resource.';

        $csv_uploads_dir = __DIR__ . '/../../public/csv_uploads';

        $request_data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();

        if ($uploadedFiles) {
            $uploadedFile = $uploadedFiles['file'];
            // Upload the file and move to new location
            if ($uploadedFile && $uploadedFile->getError() === UPLOAD_ERR_OK) {
                $filename = $csv_uploads_dir . '/' . $this->moveUploadedFile($csv_uploads_dir, $uploadedFile);

                /** Parse CSV and save to DB */
                $res = $this->save_to_db($filename);

                try{
                    unlink($filename);
                } catch (Exception $e) {
                    // do nothing
                }

                $result['success'] = true;
                $result['message'] = 'Success. CSV import has been successfully processed.';
                $result['stats'] = $res;
                // $result['filename'] =  $filename;
                return  $response->withStatus(200)->withJson($result);
            }
        }

        $result['message'] = 'Error. Something went wrong while importing users. Please try again.';
        return $response->withStatus(200)->withJson($result);
    }

    /**
     * SAVE ROWS TO DB
     * Validate each record before attempting to import/save to respective tables
     * @param $file - uploaded file
     * @return Array $result - returns an array of report statistics
     */
    private function save_to_db($file) {
        $this->logger->info($file);

        $_ctr = 0;
        $_invalid = [];
        $_saved = 0;
        $_skipped = [];
        $_isHeader = true;

        // open the file for reading
        $_file = fopen($file, "r");

        // loop within the CSV file
        while (($_row = fgetcsv($_file, 10000, ",")) !== FALSE) {

            if ($_isHeader) {
                $_isHeader = false;
                continue;
            }

            $_ctr += 1;
            $this->logger->info($_ctr . ' - ' . implode(' -- ', $_row));

            /* CSV Mapping
                0 - Employee ID
                1 - Full Name
                2 - Last Name
                3 - First Name
                4 - Middle Name
                5 - Assignment/Client
                6 - Email Address
            */

            // begin database transaction here
            DB::beginTransaction();

            try {

                $search = UserInfo::where('username', $_row[6])
                                    ->orWhere('employee_id', $_row[0])
                                    ->first();

                if ($search) {
                    continue;
                    $_skipped[] = $_ctr + 1;
                }
                
                $pw = $this->generate_default_password($_row[6], $_row[2], $_row[0]);

                $user_data = [
                    'username'          => $_row[6],
                    // 'password'          => password_hash('sample', PASSWORD_BCRYPT), 
                    'password'          => $pw['encrypted'],
                    // 'reset_hash'        => $pw['plain']
                ];
    
                $new_user = User::create(array_map('trim', $user_data));
    
                if ($new_user) {
    
                    $user_info_data = [
                        'username'          => $_row[6],
                        // 'password'          => password_hash($request_data['password'], PASSWORD_BCRYPT),
                        'user_origin'       => 1,
                        'user_id'           => $new_user->id,
                        'employee_id'       => $_row[0],
                        'first_name'        => $_row[3],
                        'last_name'         => $_row[2],
                        'middle_name'       => (isset($_row[4])) ? $_row[4] : '',
                        'email'             => $_row[6],
                        'photo'             => $_row[0] . '.jpg'
                    ];
        
                    $new_user_info = UserInfo::create(array_map('trim', $user_info_data));
                                            
                    if (!$new_user || !$new_user_info) {
                        DB::rollBack();
                        $_invalid[] = $_ctr + 1;
                    }

                    $_saved += 1;

                }

                DB::commit();  

            } catch (Exception $e) {
                DB::rollBack();
                
                $result['success'] = false;
                $result['message'] = 'Failed. CSV import has encountered error.';
                $result['filename'] =  $filename;
                return  $response->withStatus(403)->withJson($result);
            }
        }

        $result['total'] = $_ctr;
        $result['saved'] = $_saved;
        $result['skipped'] = $_skipped;
        $result['invalid_line_numbers'] = $_invalid;
        // return $response->withStatus(200)->withJson($result);

        return $result;
    }

    private function generate_default_password($email, $lastname, $employee_id) {

        $pw1    = substr($lastname, 0, 4);          // get first four (4) letters of lastname
        $pw2    = sprintf('%05d', $employee_id);    // format employee number to 5 digit with leading zeroes (0)
        $pw3    = substr($email, 0, strpos($email, "@"));  // get username from email without domain

        $plain_password     = strtoupper($pw1 . $pw2 . $pw3);
        $encrypted_password = password_hash($plain_password, PASSWORD_BCRYPT);

        return [
            'encrypted' => $encrypted_password,
            'plain'     => $plain_password
        ];
    }

    /**
     * Password validation
     * @param string $password
     * 
     * @return array $result
     */
    private function password_validation1($password) {
        $result = [];
        $result['success'] = false;
        $result['message'] = [];

        // minimum password characters 10
        if (strlen(trim($password)) <= 9) {
            $result['message'][] = 'at least 10 characters.';
        }

        // contains at least 1 capital letter
        $uppercase = preg_match('@[A-Z]@', $password);
        if (!$uppercase) {
            $result['message'][] = 'an upper case letter.';
        }

        // contains at least 1 special character
        $special = preg_match('/[\'\/~`\!@#\$%\^&\*\(\)_\-\+=\{\}\[\]\|;:"\<\>,\.\?\\\]/', $password);

        if (!$special) {
            $result['message'][] = 'a special character.';
        }

        // contains at least 1 small cap letter
        $lowercase = preg_match('@[a-z]@', $password);
        if (!$lowercase) {
            $result['message'][] = 'a lower case letter.';        
        }

        // contains at least 1 numeric character
        $number = preg_match('@[0-9]@', $password);
        if (!$number) {
            $result['message'][] = 'a numeric character.';        
        }

        if (count($result['message']) > 0) {
            return $result;
        }

        $result['success'] = true;
        return $result;
    }

    /**
     * Moves the uploaded file to the upload directory and assigns it a unique name
     * to avoid overwriting an existing uploaded file.
     *
     * @param string $directory directory to which the file is moved
     * @param UploadedFile $uploaded file uploaded file to move
     * 
     * @return string filename of moved file
     */
    private function moveUploadedFile($directory, UploadedFile $uploadedFile)
    {
        $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
        $basename = bin2hex(random_bytes(8)) . '_' . date("Y_m_d_H_i_s"); // see http://php.net/manual/en/function.random-bytes.php
        $filename = sprintf('%s.%0.8s', $basename, $extension);
        $uploadedFile->moveTo($directory . DIRECTORY_SEPARATOR . $filename);

        return $filename;
    }

}
