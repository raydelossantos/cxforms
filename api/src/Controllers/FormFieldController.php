<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

use App\Controllers\CommonController;
use App\Models\FormField;
use App\Models\Form;
use App\Controllers\SchemaBuilderController;

class FormFieldController {
    private $db;
    private $logger;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. FormField has been created.';
    const SUCCESS_UPDATE = 'Success. FormField has been updated.';
    const SUCCESS_DELETE = 'Success, FormField has been deleted.';
    const ERROR_SAVE = 'Error. FormField was not saved.';
    const ERROR_UPDATE = 'Error. FormField was not updated.';
    const ERROR_EXIST = 'Forbidden. FormField already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating FormField that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving FormField.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting FormField.';
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
            $search = FormField::where($query)->get();
        } else {
            $search = FormField::all();
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

        $search = FormField::where('id', $params['id'])->first();

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
    public function sort(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;
        $error = false;

        $request_data = $request->getParsedBody();

        if (isset($params['form_id'])) {
            $form_id = $params['form_id'];
        } else {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // begin transaction for multiple update
        DB::beginTransaction();

        try {
            foreach($request_data as $field) {

                if (!isset($field['id'])) {
                    DB::rollBack();

                    $result['message'] = 'Error. Field was not found to update it\'s sorting. Are you trying to hack? <br><br> If you think this is wrong, please send a contact Administrator.';
                    return $response->withStatus(404)->withJson($result);
                }

                $search = FormField::where('id', $field['id'])
                                    ->where('form_id', $form_id)
                                    ->first();

                if ( !empty($search) ) {
                    $search->sort = $field['sort'];
                    $search->save();
                    continue;
                } else {
                    DB::rollBack();

                    $result['message'] = 'Error. Field was not found to update it\'s sorting. Are you trying to hack? <br><br> If you think this is wrong, please send a contact Administrator.';
                    return $response->withStatus(404)->withJson($result);
                }

            }
        } catch (Exception $e) {
            DB::rollBack();
            $result['message'] = 'Error occured while updating sorting of fields.';
            return $response->withStatus(400)->withJson($result);
        }

        DB::commit();

        $result['success'] = self::SUCCESS;
        $result['message'] = 'Fields were successfully sorted out.';
        return $response->withStatus(200)->withJson($result);
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
        if (!CommonController::validate(null, $request_data, ['form_id', 'label', 'form_field_name', 'field_type'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        // Check if field duplicates another record
        $search_criteria = [
            // 'label'             => $request_data['label'],
            'form_field_name'   => $request_data['form_field_name'],
            // 'short_id'          => $request_data['short_id']
        ];

        // $search = FormField::where('form_id', $request_data['form_id'])->orWhere($search_criteria)->first();
        $search = FormField::withTrashed()->orWhere($search_criteria)->where('form_id', $request_data['form_id'])->first();

        if (count($search) > 0 ) {
            $result['message'] = 'Duplicate in Table Column Name. This also includes deleted fields.';
            return $response->withStatus(403)->withJson($result);
        }

        $last_field = FormField::where('form_id', $request_data['form_id'])->orderBy('sort', 'desc')->first();
        if ($last_field) {
            $request_data['sort'] = $last_field->sort + 1;
        }

        // Begin database transaction hrere
        DB::beginTransaction();

        $request_data['lookup_scope_id'] = !empty($request_data['lookup_scope_id']) ? json_encode($request_data['lookup_scope_id']) : '[]';

        $data = FormField::create(array_map('trim', $request_data));

        if ($data) {

            // manage table after field create/update
            $_form_name = $this->get_table_name($request_data['form_id']);

            if ($_form_name == false) {

                // error occured, revert changes
                DB::rollBack();

                $result['success'] = self::ERROR;
                $result['message'] = 'Form not found. Maybe you are referring to a non existent form?';
                return $response->withStatus(402)->withJson($result);
            }

            $_fld = FormField::find($data->id);

            $_field = [
                'name'      => $_fld->form_field_name,
                'type'      => $this->get_field_details($_fld->field_type, $_fld->size)
            ];

            $_s_builder = new SchemaBuilderController($this->logger, $this->db);
            $_field_status = 'create';
            $res = $_s_builder->manage_field($_form_name,  $_field, $_field_status);

            if ($res) {
                // all good, commit all changes to DB
                DB::commit();

                $result['success'] = self::SUCCESS;
                $result['message'] = self::SUCCESS_CREATE;
                return $response->withStatus(200)->withJson($result);
            } else {
                // error occured, revert changes
                DB::rollBack();

                $result['success'] = self::ERROR;
                $result['message'] = 'SchemaBuilderError: failed creating field.';
                return $response->withStatus(400)->withJson($result);
            }
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
        if (!CommonController::validate(null, $request_data, ['form_id', 'label', 'field_type'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        // Update record
        $app_user = FormField::find($params['id']);
        if ($app_user) {

            // map updateable fields
            $update_data = [
                'description' => $request_data['description'],
                'dropdown_name' => $request_data['dropdown_name'],
                // 'field_type' => $request_data['field_type'],
                'first_day_active' => $request_data['first_day_active'],
                // 'form_field_name' => $request_data['form_field_name'],
                'group_name' => $request_data['group_name'],
                'label' => $request_data['label'],
                'last_day_active' => $request_data['last_day_active'],
                'lookup_dependencies' => $request_data['lookup_dependencies'],
                'lookup_scope_id' => !empty($request_data['lookup_scope_id']) ? json_encode($request_data['lookup_scope_id']) : '[]',
                'lookup_source_field' => $request_data['lookup_source_field'],
                'readonly' =>$request_data['readonly'],
                'required' =>$request_data['required'],
                'role_restrictions_id' =>$request_data['role_restrictions_id'],
                'selection_options' => $request_data['selection_options'],
                // 'short_id' => $request_data['short_id'],
                'show_this_field_on_default_table_view' =>$request_data['show_this_field_on_default_table_view'],
                'size' => $request_data['size'],
                'tag_button_text' => $request_data['tag_button_text'],
                'timer_auto_start' =>$request_data['timer_auto_start'],
                'timer_duration' =>$request_data['timer_duration'] ,
                'timer_reset_action' => $request_data['timer_reset_action'],
                'url_timer_reset' => $request_data['url_timer_reset'],
                'validation_mask' => $request_data['validation_mask'],
                'visibility' => $request_data['visibility'],
                'maximum_display_characters' => $request_data['maximum_display_characters'] == '' ? 0 : $request_data['maximum_display_characters'],
            ];

            $data = $app_user->update(array_map('trim', $update_data));

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

        $field = FormField::find($params['id']);

        if ($field) {
            // Begin database transaction hrere
            DB::beginTransaction();

            $field->sort = '9999';
            $field->save();

            $data = $field->delete();
            if ($data) {

                DB::commit();

                $result['success'] = self::SUCCESS;
                $result['data'] = self::SUCCESS_DELETE;
                return $response->withStatus(200)->withJson($result);
            }

            DB::rollBack();
            $result['success'] = self::ERROR;
            $result['message'] = self::ERROR_DELETE;
            return $response->withStatus(404)->withJson($result);
        }

        $result['success'] = self::ERROR;
        $result['message'] = self::ERROR_DELETE;
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * Get Form Name via form_id
     * @param integer form_id
     *
     * @return string form_name
     */
    private function get_table_name($_form_id) {

        $_res = Form::find($_form_id);

        if ($_res) {
            return $_res->table_name;
        }

        return false;
    }

    /**
     * Assemble field type based on given details
     * @param string            $field_type
     * @param integer           $field_size
     *
     * @return string
     */
    private function get_field_details($field_type, $field_size) {

        $_fld_types = [
            'String'                => 'VARCHAR',
            'Multiline'             => 'TEXT',
            'Date'                  => 'DATE',
            'Date and Time'         => 'DATETIME',
            'Dropdown'              => 'VARCHAR(255)',
            'Checkbox'              => 'TINYINT(4)',
            'Monetary'              => 'DOUBLE',
            'Lookup'                => 'VARCHAR(255)',
            'Employee Lookup'       => 'VARCHAR(255)',
            'Timer'                 => 'VARCHAR(20)',
            'User Tag'              => 'VARCHAR(255)',
            'Description Timestamp' => 'TINYINT(4)'
        ];

        $result = $_fld_types[$field_type];

        if ($result == 'VARCHAR' && $field_size != 0) {
            return $result . '(' . $field_size . ')';
        } elseif ($result == 'VARCHAR') {
            return $result . '(255)';
        }

        return $result;

    }

    public function get_deleted(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;
        $deleted_form_fields = FormField::select('id', 'label', 'description')->where('form_id', $params['form_id'])->onlyTrashed()->get();

        if($deleted_form_fields) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $deleted_form_fields->count();
            $result['data'] = $deleted_form_fields;

            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = 'An error occured while fetching records.';
        return $response->withStatus(403)->withJson($result);
    }
    
    public function restore(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;
        $id = $request->getParsedBody('field_id');
        $form_field = FormField::where('id', $id)->onlyTrashed()->first();

        if($form_field) {
            $data = $form_field->restore();

            if($data) {
                $result['success'] = self::SUCCESS;
                $result['message'] = 'inside restore_form_field: ';
                return $response->withStatus(200)->withJson($result);
            }
        }

        $result['message'] = self::ERROR_NOT_FOUND;
        return $response->withStatus(404)->withJson($result);
    }
}