<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

use App\Models\Team;
use App\Models\FormTeam;

class TeamController {
    private $db;
    private $logger;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. Team has been created.';
    const SUCCESS_UPDATE = 'Success. Team has been updated.';
    const SUCCESS_DELETE = 'Success, Team has been deleted.';
    const ERROR_SAVE = 'Error. Team was not saved.';
    const ERROR_UPDATE = 'Error. Team was not updated.';
    const ERROR_EXIST = 'Forbidden. Team already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating Team that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving Team.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting Team.';
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
            $search = Team::where($query)->with('client')->get();
        } else {
            $search = Team::with('client')->get();
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
    public function get_all_not_in_form(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $res = FormTeam::select('team_id')->where('form_id', $params['id'])->get()->toArray();

        if (count($res) > 0) {
            $teams = Team::whereNotIn('id', $res)->get();
        } else {
            $teams = Team::get();
        }

        if ($teams) {
            $result['success'] = self::SUCCESS;
            $result['count'] = $teams->count();
            $result['data'] = $teams;
            return $response->withStatus(200)->withJson($result);
        }

        $return['message'] = "Unable to fetch data. Please try again.";
        return $response->withStatus(404)->withJson($result);
    }

    /**
     * GET ALL DELETED/TRASHED TEAM RECORDS
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
            $search = Team::onlyTrashed()->where($query)->with('client')->get();
        } else {
            $search = Team::onlyTrashed()->with('client')->get();
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

        $search = Team::where('id', $params['id'])->with('client')->first();

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
        if (!CommonController::validate(null, $request_data, ['team_name', 'team_code'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Search for existing word before processing/saving
        $search_criteria = 'team_name';
        $search_criteria2 = 'team_code';
        $search = Team::where($search_criteria, '=', $request_data[$search_criteria])
                    ->orWhere($search_criteria2, '=', $request_data[$search_criteria2])
                    ->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
            return $response->withStatus(403)->withJson($result); 
        }

        $data = Team::create(array_map('trim', $request_data));
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
    public function restore(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        $data = Team::onlyTrashed()->find($request_data['id']);

        if ($data && $data->trashed()) {
            $data->restore();

            $result['success'] = self::SUCCESS;
            $result['message'] = 'Success. Team has been restored.';
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = 'Error. Something went wrong while restoring team.';
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
        if (!CommonController::validate(null, $request_data, ['team_name'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Search for existing word before processing/saving
        $search_criteria = 'team_name';
        $search = Team::where($search_criteria, $request_data[$search_criteria])->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0 && $search->id != $params['id']) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
            return $response->withStatus(403)->withJson($result); 
        }

        // Update record
        $app_user = Team::find($params['id']);
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
    public function delete(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $search = Team::find($params['id']);

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
}
