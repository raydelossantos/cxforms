<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

use App\Models\TeamMember;
use App\Models\User;

class TeamMemberController {
    private $db;
    private $logger;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. TeamMember has been created.';
    const SUCCESS_UPDATE = 'Success. TeamMember has been updated.';
    const SUCCESS_DELETE = 'Success, TeamMember has been deleted.';
    const ERROR_SAVE = 'Error. TeamMember was not saved.';
    const ERROR_UPDATE = 'Error. TeamMember was not updated.';
    const ERROR_EXIST = 'Forbidden. TeamMember already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating TeamMember that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving TeamMember.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting TeamMember.';
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

        if($query_data['team_id']) {
            $d = json_decode($query_data['team_id']);

            if(is_array($d)) {
                $search = TeamMember::whereIn('team_id', $d)->with('user_info')->has('user_info')->get();

                $userIds = [];
                $data = [];
                foreach ($search as $key => $value) {
                    if(!in_array($value['user_id'], $userIds)) {
                        $userIds[] = $value['user_id'];
                        $data[] = $value;
                    }
                }

                $result['success'] = self::SUCCESS;
                $result['count'] = $search->count();
                $result['data'] = $data;
                return $response->withStatus(200)->withJson($result);
            }
        }

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if ( !empty($query) ) {
            $search = TeamMember::where($query)->with('user_info')->has('user_info')->get();
        } else {
            $search = TeamMember::with('user_info')->has('user_info')->get();
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
    public function get_all_teams_by_userid(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $search = TeamMember::select('team_id')->distinct('team_id')->with('team')->has('team')->where('user_id',  $params['id'])->get();

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
    public function get_all_users(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if ( !empty($query) ) {
            $team_members = TeamMember::select('user_id')->where($query)->get()->toArray();

            $search = User::whereNotIn('id', $team_members)->with('user_info')->has('user_info')->get();
        } else {
            $search = User::with('user_info')->has('user_info')->get();
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

        $search = TeamMember::where('id', $params['id'])->first();

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
        if (!CommonController::validate(null, $request_data, ['team_id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        if (count($request_data['team_members']) > 0 ) {

            /** Strat transaction to revert if error occured */
            DB::beginTransaction();

            try {

                foreach($request_data['team_members'] as $member) {

                    $data = [
                        'team_id' => $request_data['team_id'],
                        'user_id' => $member
                    ];

                    $res = TeamMember::create($data);

                    if (!$res) {
                        DB::rollBack();
                    }
                }

                DB::commit();

                $result['success'] = self::SUCCESS;
                $result['message'] = self::SUCCESS_CREATE;
                return $response->withStatus(200)->withJson($result);

            } catch (Excepiton $e) {
                DB::rollBack();
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
        if (!CommonController::validate(null, $request_data, ['user_id', 'team_id'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result);
        }

        // Update record
        $app_user = TeamMember::find($params['id']);
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

        $bot = TeamMember::find($params['id']);

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
