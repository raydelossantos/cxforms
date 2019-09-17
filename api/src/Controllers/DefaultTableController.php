<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;
use Slim\Http\Stream;
use Slim\Http\UploadedFile as UploadedFile;

use App\Models\DefaultTable;
use App\Models\Form;
use App\Models\FormField;
use App\Models\Attachment;
use App\Models\AppNotification;
use App\Models\MailLog;
use App\Models\FormUser;
use App\Models\FormTeam;
use App\Models\LineOfBusiness;
use App\Models\ClientUser;
use App\Models\LobUser;
use App\Models\TeamMember;

use App\Controllers\SchemaBuilderController;
use App\Controllers\MailController;

class DefaultTableController {
    private $db;
    private $logger;
    private $table;
    private $settings;
    private $token;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. Record has been created.';
    const SUCCESS_UPDATE = 'Success. Record has been updated.';
    const SUCCESS_DELETE = 'Success, Record has been deleted.';
    const ERROR_SAVE = 'Error. Record was not saved.';
    const ERROR_UPDATE = 'Error. Record was not updated.';
    const ERROR_EXIST = 'Forbidden. Record already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating record that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving record.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting record.';
    const ERROR_NOT_FOUND = 'Error. No record found';

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db, $settings, $token)
    {
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
    public function get_all(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set filters by getting modified request from middleware tokenAuth
        $user_id_from_middleware = $request->getAttribute('user_id_from_middleware') !== null ? $request->getAttribute('user_id_from_middleware') : null;

        $_default_fields = [
            'id',
            'date_created',
            'created_by_userid',
            'created_by_username',
            'last_modified_by_userid',
            'date_last_modified',
            'assigned_to_userid',
            'assigned_to_role',
            'date_assigned'
        ];

        $fields_to_show = FormField::select('form_field_name')
                                    ->where('form_id', $_form['id'])
                                    ->where('show_this_field_on_default_table_view', 1)
                                    ->get()
                                    ->toArray();

        $_db_fields = [];

        foreach($fields_to_show as $_fld) {
            $_db_fields[] .= $_fld['form_field_name'];
        }

        $_select_fields = array_merge($_default_fields, $_db_fields);

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        // include in the params $query the middleware parameter
        if ($user_id_from_middleware !== null) {
            $query[] = ['created_by_userid', $user_id_from_middleware];
        }

        $default_max_record = 1000;
        $is_max_record_limit = (!empty($_form['max_records_in_list_view'])) ? $_form['max_records_in_list_view'] : $default_max_record;

        if (!empty($query) ) {
            $search = $table->select($_select_fields)->where($query)->with('attachment')->orderBy('id', 'DESC')->limit($is_max_record_limit)->get();
        } else {
            $search = $table->select($_select_fields)->with('attachment')->orderBy('id', 'DESC')->limit($is_max_record_limit)->get();
        }

        if ( !empty($search) ) {
            $result['success']  = self::SUCCESS;
            $result['count']    = $search->count();
            $result['fields']   = $_db_fields;
            $result['data']     = $search;
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
        $query = [];

        // set filters by getting modified request from middleware tokenAuth
        $user_id_from_middleware = $request->getAttribute('user_id_from_middleware') !== null ? $request->getAttribute('user_id_from_middleware') : null;

        // get form info & table_name
        $_form = Form::find( $params['form_id']);

        if ($user_id_from_middleware !== null) {
            $query[] = ['created_by_userid', $user_id_from_middleware];
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        if (!empty($query)) {
            $search = $table->where($query)->where('id', $params['id'])->with('attachment')->with('creator')->with('modifier')->get();
        } else {
            $search = $table->where('id', $params['id'])->with('attachment')->with('creator')->with('modifier')->get();
        }

        if ($search->count() > 0) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $search->count();
            $result['data'] = $search[0];
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
    public function get_record_view(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;
        $query = [];

        // validate if record/link retrieving is existing from email log and/or app notification
        $user = (array) $this->token->sub->user->user;

        $app_notif = AppNotification::where('user_id', $user['id'])
                                      ->where('hash', $params['hash'])
                                      ->where('form_id', $params['form_id'])
                                      ->where('record_id', $params['id'])
                                      ->first();

        if (!$app_notif) {
            $result['message'] = self::ERROR_NOT_FOUND;
            return $response->withStatus(404)->withJson($result);
        }

        $email_notif = MailLog::where('user_id', $user['id'])
                               ->where('hash', $params['hash'])
                               ->first();

        $email_notif->is_opened = 1;
        $email_notif->save();

        // get form info & table_name
        $_form = Form::find($params['form_id']);

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        if (!empty($query)) {
            $search = $table->where($query)->where('id', $params['id'])->with('attachment')->get();
        } else {
            $search = $table->where('id', $params['id'])->with('attachment')->get();
        }

        if ($search->count() > 0) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $search->count();
            $result['data'] = $search[0];
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
        $uploadedFiles = $request->getUploadedFiles();

        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // begin database transaction here
        DB::beginTransaction();

        try {

            // Get form info & table_name
            $_form = Form::find($params['form_id']);

            // Set DefaultTable Model
            $table = new DefaultTable($_form['table_name']);

            // Get all fields for this form
            $_fields = FormField::where('form_id', $params['form_id'])->get()->toArray();

            $user_tag_fields = [];
            // Filter all User Tag fields
            foreach($_fields as $field) {
                if ($field['field_type'] == 'User Tag')
                   $user_tag_fields[] = $field['form_field_name'];
            }

            // Declare array for User Emails storage
            $recipients = [];

            // Map the request data before saving
            foreach($request_data as $key => $val) {
                if (in_array($key, $user_tag_fields) && !$val == '') {
                    $res = explode('|', $val);
                    if (isset($res[1])) {

                        // Add the email to the array
                        $recipients[] = array($res[0], $res[1]);

                        // Replace contents with pure name for saving
                        $request_data[$key] = $res[0];
                    }
                }
            }

            $request_data['created_by_userid'] = $this->token->sub->user->user->id;
            $request_data['created_by_username'] = $this->token->sub->user->user->username;

            // Save the record
            $record_new_id = $table->insertGetId(array_map('trim', $request_data));

            if ($record_new_id) {

                // if record has an uploaded file, upload and save to table
                if ($uploadedFiles) {
                    $uploadedFile = $uploadedFiles['file'];

                    // Upload the file and move to new location
                    if ($uploadedFile && $uploadedFile->getError() === UPLOAD_ERR_OK) {
                        $destination = __DIR__ . '/../../public/uploaded_files';

                        if (!$this->isFileTypeAllowed($uploadedFile)) {
                            DB::rollBack();
                            $result['message'] = 'Attachment error. The attachment file sent is not allowed.';
                            return $response->withStatus(403)->withJson($result);
                        }

                        $file_path = '/uploaded_files/' . $this->moveUploadedFile($destination, $uploadedFile);

                        $attachment = [
                            'table_name'    => 'qa_' . $_form['table_name'],
                            'record_id'     => $record_new_id,
                            'filename'      => $file_path
                        ];

                        $data_attachment = Attachment::create($attachment);

                        if ( $data_attachment ) {

                            if (count($recipients)) {
                                $notifs = $this->send_notification($recipients, $params['form_id'], $record_new_id);

                                if (!$notifs) {

                                    DB::rollBack();
                                    $result['message'] = 'Error. Sending notifications failed.';
                                    return $response->withStatus(403)->withJson($result);

                                }
                            }

                            DB::commit();

                            $result['success'] = self::SUCCESS;
                            $result['message'] = self::SUCCESS_CREATE;
                            return $response->withStatus(200)->withJson($result);

                        }
                    }

                } else {

                    if (count($recipients)) {
                        $notifs = $this->send_notification($recipients, $params['form_id'], $record_new_id);

                        if (!$notifs) {

                            DB::rollBack();
                            $result['message'] = 'Error. Sending notifications failed.';
                            return $response->withStatus(403)->withJson($result);

                        }
                    }

                    DB::commit();

                    $result['success'] = self::SUCCESS;
                    $result['message'] = self::SUCCESS_CREATE;
                    return $response->withStatus(200)->withJson($result);

                }

            }

        } catch (Exception $e) {
            DB::rollBack();

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
    public function update(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();

        // set filters by getting modified request from middleware tokenAuth
        // $edit_user_id_from_middleware = $request->getAttribute('edit_user_id_from_middleware') !== null ? $request->getAttribute('edit_user_id_from_middleware') : null;
        $user_id = $this->token->sub->user->user->id;

        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data || count($request_data) == 0)) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // get form info & table_name
        $_form = Form::find($params['form_id']);

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        // get the record to update
        $record = $table->where('id', $params['id'])->first()->toArray();

        if ($record) {

            // Get all fields for this form
            $_fields = FormField::where('form_id', $params['form_id'])->get()->toArray();

            $user_tag_fields = [];
            // Filter all User Tag fields
            foreach($_fields as $field) {
                if ($field['field_type'] == 'User Tag')
                    $user_tag_fields[] = $field['form_field_name'];
            }

            // Declare array for User Emails storage
            $recipients = [];

            // Map the request data before saving
            foreach($request_data as $key => $val) {
                if (in_array($key, $user_tag_fields) && !$val == '') {
                    $res = explode('|', $val);
                    if (isset($res[1])) {

                        // Add the email to the array
                        $recipients[] = array($res[0], $res[1]);

                        // Replace contents with pure name for saving
                        $request_data[$key] = $res[0];
                    }
                }
            }

            $_lob = LineOfBusiness::find($_form['lob_id']);

            if (!$_lob) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }

            // Check if user has lob_user permission
            $_lob_user = LobUser::where('lob_id', $_lob->id)
                                ->where('user_id', $user_id)
                                ->get()
                                ->toArray();

            // Check if user has client_user permission
            $_client_admin = ClientUser::where('client_id', $_lob->client_id)
                                       ->where('user_id', $user_id)
                                       ->get()
                                       ->toArray();

            if ($_client_admin) {

            } else if ($_lob_user) {

            } else if (!$this->token->sub->user->user->is_admin) {

                // Get form permissions
                $form_permission = FormUser::where('user_id', $user_id)
                                           ->where('form_id', $params['form_id'])
                                           ->get();

                if (count($form_permission) === 0) {
                    $teams = TeamMember::select('team_id')
                                       ->distinct('team_id')
                                       ->where('user_id', $user_id)
                                       ->get()
                                       ->toArray();

                    $form_teams = FormTeam::where('form_id', $params['form_id'])
                                          ->whereIn('team_id', $teams)
                                          ->orderBy('id', 'ASC')
                                          ->get();

                    if ($form_teams) $form_permission = $form_teams;
                }

                $edit_own = false;
                $edit_all = false;
                
                foreach($form_permission as $fp) {

                    if ($fp->edit_own) $edit_own = true;
                    if ($fp->edit_all) $edit_all = true;

                }

                // check if record is owned by user updating it
                if (!$edit_own && !$edit_all) {
                    $return['success']  = false;
                    $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                    return $response->withStatus(401)->withJson($return);
                }

                if ($edit_own && !$edit_all) {
                    if ($record['created_by_userid'] !== $user_id) {
                        $return['success']  = false;
                        $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                        return $response->withStatus(401)->withJson($return);
                    }
                }
            }

            // Update record
            $record = $table->where('id', $params['id']);
            $data = $record->update($request_data);


            // if ($data) {

                if ($uploadedFiles) {
                    $uploadedFile = $uploadedFiles['file'];

                    // Upload the file and move to new location
                    if ($uploadedFile && $uploadedFile->getError() === UPLOAD_ERR_OK) {
                        $destination = __DIR__ . '/../../public/uploaded_files';

                        if (!$this->isFileTypeAllowed($uploadedFile)) {
                            DB::rollBack();
                            $result['message'] = 'Attachment error. The attachment file sent is not allowed.';
                            return $response->withStatus(403)->withJson($result);
                        }

                        $file_path = '/uploaded_files/' . $this->moveUploadedFile($destination, $uploadedFile);

                        $attachment = [
                            'table_name'    => 'qa_' . $_form['table_name'],
                            'record_id'     => $params['id'],
                            'filename'      => $file_path
                        ];

                        $data_attachment = Attachment::create($attachment);

                        if ( $data_attachment ) {

                            if (count($recipients)) {
                                $notifs = $this->send_notification($recipients, $params['form_id'], $params['id']);

                                if (!$notifs) {

                                    DB::rollBack();
                                    $result['message'] = 'Error. Sending notifications failed.';
                                    return $response->withStatus(403)->withJson($result);

                                }
                            }

                            DB::commit();

                            $result['success'] = self::SUCCESS;
                            $result['message'] = self::SUCCESS_UPDATE;
                            return $response->withStatus(200)->withJson($result);

                        }
                    }

                } else {

                    if (count($recipients)) {
                        $notifs = $this->send_notification($recipients, $params['form_id'], $params['id']);

                        if (!$notifs) {

                            DB::rollBack();
                            $result['message'] = 'Error. Sending notifications failed.';
                            return $response->withStatus(403)->withJson($result);

                        }
                    }

                    DB::commit();

                    $result['success'] = self::SUCCESS;
                    $result['message'] = self::SUCCESS_UPDATE;
                    return $response->withStatus(200)->withJson($result);

                }
            // }

            $result['success'] = self::SUCCESS;
            $result['message'] = 'No changes were made to the record';
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = self::ERROR_NOT_EXIST;
        return $response->withStatus(404)->withJson($result);
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

        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        // set filters by getting modified request from middleware tokenAuth
        // $edit_user_id_from_middleware = $request->getAttribute('edit_user_id_from_middleware') !== null ? $request->getAttribute('edit_user_id_from_middleware') : null;
        $user_id = $this->token->sub->user->user->id;

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        $search = $table->find($params['id']);

        if ($search) {

            $_lob = LineOfBusiness::find($_form['lob_id']);

            if (!$_lob) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }

            // Check if user has lob_user permission
            $_lob_user = LobUser::where('lob_id', $_lob->id)
                                ->where('user_id', $user_id)
                                ->get()
                                ->toArray();

            // Check if user has client_user permission
            $_client_admin = ClientUser::where('client_id', $_lob->client_id)
                                       ->where('user_id', $user_id)
                                       ->get()
                                       ->toArray();

            if ($_client_admin) {
                $data = $search->delete();

                if ($data) {
                    $result['success'] = self::SUCCESS;
                    $result['data'] = self::SUCCESS_DELETE;
                    return $response->withStatus(200)->withJson($result);
                }
            }

            if ($_lob_user) {
                $data = $search->delete();

                if ($data) {
                    $result['success'] = self::SUCCESS;
                    $result['data'] = self::SUCCESS_DELETE;
                    return $response->withStatus(200)->withJson($result);
                }
            }

            // Check if user is not admin
            if (!$this->token->sub->user->user->is_admin) {

                // Get form permissions
                $form_permission = FormUser::where('user_id', $user_id)
                                           ->where('form_id', $params['form_id'])
                                           ->get();

                if (!$form_permission) {
                    $teams = TeamMember::select('team_id')
                                       ->distinct('team_id')
                                       ->where('user_id', $user_id)
                                       ->get()
                                       ->toArray();

                    $form_teams = FormTeam::where('form_id', $params['form_id'])
                                          ->whereIn('team_id', $teams)
                                          ->orderBy('id', 'ASC')
                                          ->get();

                    if ($form_teams) $form_permission = $form_teams;
                }

                $edit_own = false;
                $edit_all = false;
                
                foreach($form_permission as $fp) {

                    if ($fp->edit_own) $edit_own = true;
                    if ($fp->edit_all) $edit_all = true;

                }

                // check if user has edit access to the record
                if (!$edit_own && !$edit_all) {
                    $return['success']  = false;
                    $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                    return $response->withStatus(401)->withJson($return);
                }

                // check if record is owned by user updating it
                if ($edit_own && !$edit_all) {
                    // check if record is owned by user
                    if ($search['created_by_userid'] !== $user_id) {
                        $return['success']  = false;
                        $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                        return $response->withStatus(401)->withJson($return);
                    }
                }
            }

            $data = $search->delete();
            if ($data) {
                $result['success'] = self::SUCCESS;
                $result['data'] = self::SUCCESS_DELETE;
                return $response->withStatus(200)->withJson($result);
            }
        }
        $result['success'] = self::ERROR;
        $result['message'] = 'Forbidden. You are deleting a record that do not exist.';
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * This function is used to update a record assigned or tagged to user
     * If tagging details are valid, it should be updated regardless of
     * edit permission granted to user on the form
     *
     * NOTE: Form permission must be given to view the record
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function update_record(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();


        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data || count($request_data) == 0)) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // get form info & table_name
        $_form = Form::find($params['form_id']);

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        // get the record to update
        $record = $table->where('id', $params['id'])->first()->toArray();

        if ($record) {

            $user = (array) $this->token->sub->user->user;

            $app_notif = AppNotification::where('user_id', $user['id'])
                                        ->where('hash', $params['hash'])
                                        ->where('form_id', $params['form_id'])
                                        ->first();

            if (!$app_notif) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }

            // Get all fields for this form
            $_fields = FormField::where('form_id', $params['form_id'])->get()->toArray();

            $user_tag_fields = [];
            // Filter all User Tag fields
            foreach($_fields as $field) {
                if ($field['field_type'] == 'User Tag')
                    $user_tag_fields[] = $field['form_field_name'];
            }

            // Declare array for User Emails storage
            $recipients = [];

            // Map the request data before saving
            foreach($request_data as $key => $val) {
                if (in_array($key, $user_tag_fields) && !$val == '') {
                    $res = explode('|', $val);
                    if (isset($res[1])) {

                        // Add the email to the array
                        $recipients[] = array($res[0], $res[1]);

                        // Replace contents with pure name for saving
                        $request_data[$key] = $res[0];
                    }
                }
            }

            // Update record
            $record = $table->where('id', $params['id']);
            $data = $record->update($request_data);


            // if ($data) {

                if ($uploadedFiles) {
                    $uploadedFile = $uploadedFiles['file'];

                    // Upload the file and move to new location
                    if ($uploadedFile && $uploadedFile->getError() === UPLOAD_ERR_OK) {
                        $destination = __DIR__ . '/../../public/uploaded_files';

                        if (!$this->isFileTypeAllowed($uploadedFile)) {
                            DB::rollBack();
                            $result['message'] = 'Attachment error. The attachment file sent is not allowed.';
                            return $response->withStatus(403)->withJson($result);
                        }

                        $file_path = '/uploaded_files/' . $this->moveUploadedFile($destination, $uploadedFile);

                        $attachment = [
                            'table_name'    => 'qa_' . $_form['table_name'],
                            'record_id'     => $params['id'],
                            'filename'      => $file_path
                        ];

                        $data_attachment = Attachment::create($attachment);

                        if ( $data_attachment ) {

                            if (count($recipients)) {
                                $notifs = $this->send_notification($recipients, $params['form_id'], $params['id']);

                                if (!$notifs) {

                                    DB::rollBack();
                                    $result['message'] = 'Error. Sending notifications failed.';
                                    return $response->withStatus(403)->withJson($result);

                                }
                            }

                            DB::commit();

                            $result['success'] = self::SUCCESS;
                            $result['message'] = self::SUCCESS_CREATE;
                            return $response->withStatus(200)->withJson($result);

                        }
                    }

                } else {

                    if (count($recipients)) {
                        $notifs = $this->send_notification($recipients, $params['form_id'], $params['id']);

                        if (!$notifs) {

                            DB::rollBack();
                            $result['message'] = 'Error. Sending notifications failed.';
                            return $response->withStatus(403)->withJson($result);

                        }
                    }

                    DB::commit();

                    $result['success'] = self::SUCCESS;
                    $result['message'] = self::SUCCESS_CREATE;
                    return $response->withStatus(200)->withJson($result);

                }
            // }

            $result['success'] = self::SUCCESS;
            $result['message'] = 'No changes were made to the record';
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = self::ERROR_NOT_EXIST;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function export(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParsedBody();
        $query = [];

        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        foreach ($query_data['fields'] as $_fld) {
            $fields_selected[] = $_fld['id'];
            $fields_title[] =  $_fld['title'];
        }

        $start_date = $query_data['start_date']; // . '00:00:00';
        $end_date = $query_data['end_date']; // . '11:59:59';

        $include_creator = isset($query_data['include_creator']) ? $query_data['include_creator'] : false;
        $include_modifier = isset($query_data['include_modifier']) ? $query_data['include_modifier'] : false;

        if ( !empty($query_data['filter']) ) {
            $custom_filter = [];
            foreach ($query_data['filter'] as $filter) {
                $custom_filter[] = [
                    $filter['column'],
                    $filter['option'],
                    $filter['option'] == 'like' ? '%' . $filter['text'] . '%' : $filter['text']
                ];
            }
        }

        if ( !empty($fields_selected) ) {
            $search = $table->select($fields_selected)
                            ->where('date_created', '>', $start_date)
                            ->whereAnd('date_created', '<', $end_date);

            if ($include_creator) {
                $search = $search->with('creator');
            }

            if ($include_modifier) {
                $search = $search->with('modifier');
            }

            if (!empty($custom_filter)) {
                $search = $search->where($custom_filter);
            }

            $search = $search->get();


            if ($search) {
                $result['success']      = self::SUCCESS;
                $result['count']        = $search->count();
                $result['data']         = $search;
                $result['fields']       = $fields_selected;
                $result['fields_title'] = $fields_title;

                return $response->withStatus(200)
                                ->withJson($result);
            }
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
    public function search(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParsedBody();
        $query = [];

        // set filters by getting modified request from middleware tokenAuth
        $user_id_from_middleware = $request->getAttribute('user_id_from_middleware') !== null ? $request->getAttribute('user_id_from_middleware') : null;


        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        if ( !empty($query_data['filter']) ) {
            $custom_filter = [];
            foreach ($query_data['filter'] as $filter) {
                $custom_filter[] = [
                    $filter['column'],
                    $filter['option'],
                    $filter['option'] == 'like' ? '%' . $filter['text'] . '%' : $filter['text']
                ];
            }
        }

        if ( !empty($custom_filter) ) {
            $search = $table;

            // include in the params $query the middleware parameter
            if ($user_id_from_middleware !== null) {
                $search = $search->where('created_by_userid', $user_id_from_middleware);
            }

            if (!empty($custom_filter)) {
                $search = $search->where($custom_filter);
            }

            $search = $search->get();

            if ($search) {
                $result['success']      = self::SUCCESS;
                $result['count']        = $search->count();
                $result['data']         = $search;

                return $response->withStatus(200)
                                ->withJson($result);
            }
        }

        $result['message'] = 'Invalid filters. Please specify filter(s) before proceeding.';
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function delete_attachment(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        // set filters by getting modified request from middleware tokenAuth
        $edit_user_id_from_middleware = $request->getAttribute('edit_user_id_from_middleware') !== null ? $request->getAttribute('edit_user_id_from_middleware') : null;

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        $search = $table->find($params['id']);

        if ($search) {
            // check if record is owned by user
            if ($edit_user_id_from_middleware && ($search['created_by_userid'] !== $edit_user_id_from_middleware)) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }

            $attachment = Attachment::find($params['a_id']);

            if ($attachment) {

                $filename = __DIR__ . '/../../public' . $attachment->filename;

                if (file_exists($filename)) {
                    unlink($filename);
                } else {
                    $result['error'] = "File not found.";
                }

                $data = $attachment->delete();

                if ($data) {
                    $result['success'] = self::SUCCESS;
                    $result['message'] = "Attachment has been deleted successfully.";
                    return $response->withStatus(200)->withJson($result);
                }
            }
        }
        $result['success'] = self::ERROR;
        $result['message'] = 'Forbidden. You are deleting a record that do not exist.';
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface      $response
     * @param array                                    $params
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function get_record_tag(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        if (!isset($params['form_id']) || !isset($params['id'])) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);    
        }
        
        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        // set filters by getting modified request from middleware tokenAuth
        $user_id_from_middleware = $request->getAttribute('user_id_from_middleware') !== null ? $request->getAttribute('user_id_from_middleware') : null;

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        $search = $table->find($params['id']);

        if ($search) {
            // check if record is owned by user
            if ($user_id_from_middleware && ($search['created_by_userid'] !== $user_id_from_middleware)) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }

            $search = AppNotification::where('form_id', $params['form_id'])
                                    ->where('record_id', $params['id'])
                                    ->with('user')
                                    ->orderBy('id', 'DESC')
                                    ->get();
        
            if ( !empty($search) ) {
                $result['success'] = self::SUCCESS;
                $result['count'] = $search->count();
                $result['data'] = $search;
                return $response->withStatus(200)->withJson($result);
            }

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
    public function delete_record_tag(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        if (!isset($params['tag_id']) || !isset($params['id']) || !isset($params['form_id'])) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }
        
        // get form info & table_name
        $_form = Form::find($params['form_id'])->toArray();

        // set filters by getting modified request from middleware tokenAuth
        $edit_user_id_from_middleware = $request->getAttribute('edit_user_id_from_middleware') !== null ? $request->getAttribute('edit_user_id_from_middleware') : null;

        if (!$_form) {
            $result['message'] = 'Form not found or you may not have access privilege.';
            return $response->withStatus(404)->withJson($result);
        }

        // set DefaultTable Model
        $table = new DefaultTable($_form['table_name']);

        $search = $table->find($params['id']);

        if ($search) {
            // check if record is owned by user
            if ($edit_user_id_from_middleware && ($search['created_by_userid'] !== $edit_user_id_from_middleware)) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }

            $search = AppNotification::find($params['tag_id']);
        
            if ( !empty($search) ) {
                $record = $search->delete();

                if ($record) {
                    $result['success'] = self::SUCCESS;
                    $result['mesage'] = 'Successfully deleted user tag on this record.';
                    return $response->withStatus(200)->withJson($result);
                }
            }
        }

        $result['message'] = self::ERROR_NOT_FOUND;
        return $response->withStatus(404)->withJson($result);
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


    /**
     * Check uploaded filetype
     *
     * @param UploadedFile $uploaded file uploaded file to move
     *
     * @return boolean true|false 
     */
    private function isFileTypeAllowed(UploadedFile $uploadedFile)
    {
        $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);

        $allowed_files = [
                            'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tif', 'tiff', 'svg',   // images
                            'zip', 'rar', 'pdf', 'tar', 'gzip',                         // archives
                            'mp3', 'wav', 'amr',                                        // audio
                            'mpeg4', 'mp4', '3gp', '3gpp', 'mov', 'avi', 'flv', 'ogg',  // video
                            'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',  // documents
                            'psd', 'ai', 'dxf', 'eps',                                  // other file types
                        ];

        if ( !in_array( strtolower( $extension ), $allowed_files ) ) {
            return false;
        }

        return true;
    }

    

    /**
     * Function to send notifications for add/create record
     * and edit/update record.
     *
     * This function only works for changes in record (update)
     * where user tag field was changed.
     *
     * @param array     $recipients
     * @param integer   $form_id
     * @param integer   $record_id
     */
    private function send_notification( $recipients, $form_id, $record_id ) {

        if (count($recipients) > 0) {
            // Create an instance of common controller to send notifications
            $notif = new CommonController($this->logger, $this->db, $this->settings);

            foreach($recipients as $recipient) {

                $link       = '/form/' . $form_id . '/view/' . $record_id;
                $type       = 'tag';
                $receiver   = $recipient;

                // Send the formatted notifcation
                $send_notif = $notif->send_notification($type, $link, $receiver, $form_id, $record_id);

                if ( !$send_notif ) {
                   return false;
                }
            }

            return true;
        }
    }

}