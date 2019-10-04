<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

use App\Models\FormUser;
use App\Models\Form;
use App\Models\AppNotification;

class FormUserController {
    private $db;
    private $logger;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. Form User Permission has been created.';
    const SUCCESS_UPDATE = 'Success. Form User Permission has been updated.';
    const SUCCESS_DELETE = 'Success, Form User Permission has been deleted.';
    const ERROR_SAVE = 'Error. Form User Permission was not saved.';
    const ERROR_UPDATE = 'Error. Form User Permission was not updated.';
    const ERROR_EXIST = 'Forbidden. Form User Permission already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating Form User Permission that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving Form User Permission.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting Form User Permission.';
    const ERROR_NOT_FOUND = 'Error. No record found';

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db)
    {
        $this->logger = $logger;
        $this->db = $db;
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_all(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if ( !empty($query) ) {
            $search = FormUser::where($query)->with('user_info')->with('user')->get();
        } else {
            $search = FormUser::with('user_info')->with('user')->all();
        }

        if ( !empty($search) ) {
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
    public function get(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $search = FormUser::where('id', $params['id'])->with('user_info')->with('user')->first();

        if ( !empty($search) ) {
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
        if (!CommonController::validate(null, $request_data, ['form_id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        if (count($request_data['user_id']) > 0) {
            DB::beginTransaction();

            try {
                foreach($request_data['user_id'] as $user) {

                    if (empty(trim($user)) || is_null(trim($user)) || trim($user == '')) {
                        DB::rollBack();

                        $result['message'] = 'Error. User cannot be blank.';
                        return $response->withStatus(400)->withJson($result);
                    }

                    $search = FormUser::where('user_id', $user)
                                        ->where('form_id', $request_data['form_id'])
                                        ->first();

                    if (count($search) > 0) {
                        DB::rollBack();

                        $result['message'] = sprintf(self::ERROR_EXIST, $user);
                        return $response->withStatus(403)->withJson($result);
                    }

                    $form = Form::where('id', $request_data['form_id'])
                                ->with('lob.client')
                                ->first();

                    $data = [
                        'user_id'           => $user,
                        'form_id'           => $request_data['form_id'],
                        'lob_id'            => $form->lob_id,
                        'client_id'         => $form->lob->client->id,
                        'add_record'        => isset($request_data['add_record'])        ? $request_data['add_record']        : 0,
                        'view_own'          => isset($request_data['view_own'])          ? $request_data['view_own']        : 0,
                        'edit_own'          => isset($request_data['edit_own'])          ? $request_data['edit_own']        : 0,
                        'view_all'          => isset($request_data['view_all'])          ? $request_data['view_all']        : 0,
                        'edit_all'          => isset($request_data['edit_all'])          ? $request_data['edit_all']        : 0,
                        'configure_list'    => isset($request_data['configure_list'])    ? $request_data['configure_list']  : 0,
                        'access_control'    => isset($request_data['access_control'])    ? $request_data['access_control']  : 0,
                        'export_data'       => isset($request_data['export_data'])       ? $request_data['export_data']     : 0,
                    ];

                    $res = FormUser::create($data);

                    
                    /** ************************************* **/
                    /**      BEGIN IN APP NOTIFICATION        **/
                    /** ************************************* **/

                    $label = 'You were granted access to form [' . $form->form_name . ']';
                    $link = '/form/' . $request_data['form_id'];

                    $app_notif = AppNotification::create(
                        [
                            'user_id'       => $user,
                            'link'          => $link,
                            'label'         => $label,
                            'form_id'       => $form->id,
                            'type'          => 'permission',
                            'icon'          => 'file-text'
                        ]
                    );

                    if (!$res) {
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


    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function update(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['form_id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Update record
        $app_user = FormUser::find($params['id']);
        if ($app_user) {
            $data = $app_user->update(array_map('trim', $request_data));
        
            if ($data) {
                $result['success'] = self::SUCCESS;
                $result['message'] = self::SUCCESS_UPDATE;
                return $response->withStatus(200)->withJson($result);
            }

            $result['message'] = self::ERROR_SAVING;
            return $response->withStatus(403)->withJson($result);
        }

        $result['message'] = self::ERROR_NOT_EXIST;
        return $response->withStatus(403)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function update_batch(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();

        // Check if request is null or empty
        if (count($request_data) == 0) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        DB::beginTransaction();
        try {
            foreach($request_data as $permission) {
                // find the record if exists
                $app_user = FormUser::where('id', $permission['id'])->where('form_id', $params['form_id'])->first();

                // if record found, try updating
                if ($app_user) {
                    $data = $app_user->update(array_map('trim', $permission));
                
                    if ($data) {
                        continue;
                    } else {
                        DB::rollBack();
                        $result['message'] = self::ERROR_SAVING;
                        return $response->withStatus(403)->withJson($result);
                    }                
                } else {
                    DB::rollBack();
                    $result['message'] = self::ERROR_NOT_EXIST;
                    return $response->withStatus(403)->withJson($result);
                }
            }
        } catch (Exception $e) {
            DB::rollBack();
            $result['message'] = 'An error occured while updating user permissions.\n' . $e->message;
            return $response->withStatus(403)->withJson($result);
        }
        
        DB::commit();
        $result['success'] = self::SUCCESS;            
        $result['data'] = self::SUCCESS_UPDATE;
        return $response->withStatus(200)->withJson($result);
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

        $bot = FormUser::find($params['id']);

        if ($bot) {
            $data = $bot->delete();
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
        $result['message'] = self::ERROR_DELETE;
        return $response->withStatus(404)->withJson($result);
    }

        /**
     * Send Email Notification when User has been tagged in a record
     * @param integer   $form_id
     * @param array     $user_emails - Users emails to send notifications
     * 
     * @return void
     */
    private function send_tagged_notification($form_id, $username, $record_id, $user_emails) {
        $subject = 'Tagged Notification';

        $sender = [
            $this->settings['qagold_email_sender']['name'],
            $this->settings['qagold_email_sender']['email']
        ];

        $custom = [
            'cc' => [],
            'bcc' => []
        ];

        $file = __DIR__ . '/../Templates/permission_granted.html';

        $body = file_get_contents($file, FILE_USE_INCLUDE_PATH);

        $link = $this->settings['qagold_link'] . 'form/' . $form_id;            # !!!!!! UPDATE THIS ONE WITH VIEW RECORD & HASH

        foreach($user_emails as $user_email) {
            // generate a unique hash for each user notification for checking on is_opened
            $hash = hash('sha256', sha1(uniqid().time()) );

            // change the body greeting
            $body = str_replace("{{ user_name }}", $username . '! <p style="font-size: 10px; color: gray;">' . $user_email[0] . '</p>', $body);

            // change the link based on the record view link
            $body = str_replace("{{ link_to_open }}", $link, $body);


            // in this area, this should insert record to DB
            $mailer = new MailController($this->logger, $this->settings);
            $mailer->send($sender, $user_email, $subject, $body, $custom);
        }

    }
}
