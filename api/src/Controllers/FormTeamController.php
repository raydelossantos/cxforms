<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

use App\Models\FormTeam;
use App\Models\Form;

class FormTeamController {
    private $db;
    private $logger;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. Form Team Permission has been created.';
    const SUCCESS_UPDATE = 'Success. Form Team Permission has been updated.';
    const SUCCESS_DELETE = 'Success, Form Team Permission has been deleted.';
    const ERROR_SAVE = 'Error. Form Team Permission was not saved.';
    const ERROR_UPDATE = 'Error. Form Team Permission was not updated.';
    const ERROR_EXIST = 'Forbidden. Form Team Permission already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating Form Team Permission that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving Form Team Permission.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting Form Team Permission.';
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
            $search = FormTeam::where($query)->with('team')->get();
        } else {
            $search = FormTeam::with('team')->all();
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

        $search = FormTeam::where('id', $params['id'])->with('team')->first();

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
        if (!CommonController::validate(null, $request_data, ['team_id', 'form_id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        $search = FormTeam::where('team_id', $request_data['team_id'])
                            ->where('form_id', $request_data['form_id'])
                            ->first();
        
        if (count($search) > 0) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data['user_id']);
            return $response->withStatus(403)->withJson($result);
        }

        $form = Form::where('id', $request_data['form_id'])
            ->with('lob.client')
            ->first();

        $request_data['lob_id']            = $form->lob_id;
        $request_data['client_id']         = $form->lob->client->id;

        $data = FormTeam::create(array_map('trim', $request_data));
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
        if (!CommonController::validate(null, $request_data, ['team_id', 'form_id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Update record
        $app_user = FormTeam::find($params['id']);
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
                $search = FormTeam::where('id', $permission['id'])->where('form_id', $params['form_id'])->first();

                // if record found, try updating
                if ($search) {
                    $data = $search->update(array_map('trim', $permission));
                
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
            $result['message'] = 'An error occured while updating team permissions.\n' . $e->message;
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

        $bot = FormTeam::find($params['id']);

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
}
