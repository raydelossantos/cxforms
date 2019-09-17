<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Capsule\Manager as DB;

use App\Models\AppNotification;

class AppNotificationController {
    private $db;
    private $logger;
    private $token;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. App notification has been created.';
    const SUCCESS_UPDATE = 'Success. App notification has been updated.';
    const SUCCESS_DELETE = 'Success, App notification has been deleted.';
    const ERROR_SAVE = 'Error. App notification was not saved.';
    const ERROR_UPDATE = 'Error. App notification was not updated.';
    const ERROR_EXIST = 'Forbidden. App notification already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating App notification that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving App notification.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Unable to delete app notification. Make sure it exists or you have permission to it.';
    const ERROR_NOT_FOUND = 'Error. No record found';

    /**
     * @param \Psr\Log\LoggerInterface $logger
     * @param string $db connection
     */
    public function __construct(LoggerInterface $logger, $db, $token)
    {
        $this->logger = $logger;
        $this->db = $db;
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

        $user_id = $this->token->sub->user->user->id;

        // $query_data = $request->getParams();
        // $query = [];

        // foreach($query_data as $q_key => $q_value) {
        //     $query[] = [$q_key, $q_value];
        // }

        // if ( !empty($query) ) {
            $search = AppNotification::where('user_id', $user_id)->with('form:id,form_name')->where('deleted', 0)->orderBy('id', 'DESC')->limit(100)->get();
        // } else {
            // $search = AppNotification::with('form:id,form_name')->where('deleted', 0)->orderBy('id', 'DESC')->limit(100)->all();
        // }

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

        $user_id = $this->token->sub->user->user->id;

        $search = AppNotification::where('id', $params['id'])->where('user_id', $user_id)->first();

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
    public function mark_as_read(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $user_id = $this->token->sub->user->user->id;

        $request_data = $request->getParsedBody();
        
        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Search for the record being updated
        $notif = AppNotification::where('id', $params['id'])->where('user_id', $user_id)->first();

        if ($notif) {

            $notif->is_opened = 1;
            $data = $notif->save();
        
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
    public function mark_all_as_read(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $user_id = $this->token->sub->user->user->id;

        $notif = AppNotification::where('is_opened', 0)->where('user_id', $user_id)->get();
        
        if ($notif) {

            foreach($notif as $not) {
                $not->is_opened = 1;
                $not->save();
            }

            $result['success'] = self::SUCCESS;
            $result['message'] = self::SUCCESS_UPDATE;
            return $response->withStatus(200)->withJson($result);

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

        $user_id = $this->token->sub->user->user->id;

        $notif = AppNotification::where('id', $params['id'])
                                ->where('user_id', $user_id)
                                ->where('deleted', 0)
                                ->first();

        if ($notif) {
            $notif->deleted = true;
            $data = $notif->save();

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
    public function delete_all(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;

        $user_id = $this->token->sub->user->user->id;

        $notif = AppNotification::where('user_id', $user_id)->where('deleted', false)->get();

        if ($notif) {

            foreach($notif as $not) {
                $not->deleted = true;
                $not->save();
            }

            $result['success'] = self::SUCCESS;            
            $result['data'] = self::SUCCESS_DELETE;
            return $response->withStatus(200)->withJson($result);
            
        }
        
        $result['success'] = self::ERROR;
        $result['message'] = self::ERROR_DELETE;
        return $response->withStatus(404)->withJson($result);
    }
}
