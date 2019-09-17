<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

use App\Models\Form;
use App\Models\FormUser;
use App\Models\FormTeam;
use App\Controllers\SchemaBuilderController;

class FormController {
    private $db;
    private $logger;
    private $settings;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. Form has been created.';
    const SUCCESS_UPDATE = 'Success. Form has been updated.';
    const SUCCESS_DELETE = 'Success, Form has been deleted.';
    const ERROR_SAVE = 'Error. Form was not saved.';
    const ERROR_UPDATE = 'Error. Form was not updated.';
    const ERROR_EXIST = 'Forbidden. Form already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating Form that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving Form.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting Form.';
    const ERROR_NOT_FOUND = 'Error. Form not found.';

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db, $settings)
    {
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
            $search = Form::where($query)->has('lob.client')->get();
        } else {
            $search = Form::all()->has('lob.client')->get();
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
    public function get_all_deleted(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if ( !empty($query) ) {
            $search = Form::onlyTrashed()->where($query)->with('creator')->with('lob.client')->has('lob.client')->get();
        } else {
            $search = Form::onlyTrashed()->with('creator')->with('lob.client')->has('lob.client')->get();
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

        $search = Form::where('id', $params['id'])->with('fields')->with('lob.client')->has('lob.client')->first();

        if ( !empty($search) ) {

            if ($search->hash !== '' or !is_null($search->hash)) {
                $search['wp_link'] = $this->settings['wp_login_link'] . '/' . $search['hash'];
            }

            $result['success'] = self::SUCCESS;
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
    public function get_form_by_hash(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $search = Form::where('hash', $params['hash'])->with('fields')->with('lob.client')->has('lob.client')->first();

        if ( !empty($search) ) {
            $result['success'] = self::SUCCESS;
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
    public function get_permission(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $search = Form::where('id', $params['id'])->with('lob.client')->has('lob.client')->first();

        if ( !empty($search) ) {
            $result['success'] = self::SUCCESS;
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
    public function get_form_by_table_name(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $search = Form::where('table_name', $params['id'])->with('fields')->with('lob.client')->has('lob.client')->first();

        if ( !empty($search) ) {
            $result['success'] = self::SUCCESS;
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
        if (!CommonController::validate(null, $request_data, ['form_name', 'lob_id', 'table_name', 'created_by'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Check if formName exists on the same LOB ID
        $search_criteria = [
            'form_name'     => $request_data['form_name'],
            // 'short_name'    => $request_data['short_name'],
            'table_name'    => $request_data['table_name']
        ];
        
        $search = Form::orWhere($search_criteria)->where('lob_id', $request_data['lob_id'])->first();
        if (count($search) > 0 ) {
            $result['message'] = 'Duplicate either in Form Name, Short Name or Table Name.';
            return $response->withStatus(403)->withJson($result); 
        }

        if ( $request_data['max_records_in_list_view'] != '' && (int) $request_data['max_records_in_list_view'] > 1000 ) {
            $result['message'] = 'Maximum allowable intial records to load is 1000.';
            return $response->withStatus(403)->withJson($result); 
        }

        if ( !in_array($request_data['form_type'], [0, 1]) ) {
            $result['message'] = 'Invalid form type. Kindly select the proper form type.';
            return $response->withStatus(403)->withJson($result);
        }

        // Begin database transaction hrere
        DB::beginTransaction();

        // generate a hash for this form (used for WP links)
        $request_data['hash'] = hash('sha256', sha1(uniqid().time()));

        // Save the record
        $data = Form::create(array_map('trim', $request_data));
        if ($data) {

            // New form created, create the form
            $res = SchemaBuilderController::manage_table($request_data['table_name']);

            if ($res) {
                DB::commit();

                $result['success'] = self::SUCCESS;
                $result['form_id'] = $data->id;
                $result['message'] = self::SUCCESS_CREATE;
                return $response->withStatus(200)->withJson($result);
            }

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
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['form_name', 'modified_by'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        if ( $request_data['max_records_in_list_view'] != '' && (int) $request_data['max_records_in_list_view'] > 1000 ) {
            $result['message'] = 'Maximum allowable intial records is 1000. Please enter 0-1000 only.';
            return $response->withStatus(403)->withJson($result); 
        }

        if ( !in_array($request_data['form_type'], [0, 1]) ) {
            $result['message'] = 'Invalid form type. Kindly select the proper form type.';
            return $response->withStatus(403)->withJson($result);
        }

        // Update record
        $form = Form::find($params['id']);
        if ($form) {

            // Update/fill hash code if form_type is changed and if hash is null
            if ($request_data['form_type'] == 1 && $form->hash === null) {
                $request_data['hash'] = hash('sha256', sha1(uniqid().time()));
            }

            $data = $form->update(array_map('trim', $request_data));
        
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
    public function delete(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $search = Form::find($params['id']);

        if ($search) {
            $data = $search->delete();
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
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        $data = Form::onlyTrashed()->find($request_data['id']);

        if ($data && $data->trashed()) {
            $data->restore();

            $result['success'] = self::SUCCESS;
            $result['message'] = 'Success. Form has been restored.';
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = 'Error. Something went wrong while restoring form.';
        return $response->withStatus(403)->withJson($result);
    }
}
