<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

use App\Models\UserLog;

class UserLogController {

    private $logger;
    private $db;
    const SUCCESS = true;
    const ERROR = false;

    /**
     *
     */
    public function __construct(LoggerInterface $logger, $db) {

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
        $result['success'] = false;

        $columns = ['id', 'user_id','activity', 'ip_address', 'created_at'];
        
        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if ( !empty($query) ) {
            $search = UserLog::where($query)->with('user')->orderBy('id', 'DESC')->limit(1000)->get();
        } else {
            $search = UserLog::with('user')->orderBy('id', 'DESC')->limit(1000)->get();
        }

        if ( !empty($search) ) {
            $result['success'] = true;
            $result['count'] = $search->count();
            $result['data'] = $search;
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = false_NOT_FOUND;
        return $response->withStatus(404)->withJson($result);
    }

    public function filter(Request $request, Response $response, $params) {
        $result = [];
        $result['success'] = self::ERROR;
        $query_data = $request->getParsedBody();
        $query = [];
        
        if(!empty($query_data['filter'])) {
            $custom_filter = [];
            
            foreach($query_data['filter'] as $filter) {
                $custom_filter[] = [
                    $filter['column'],
                    $filter['option'],
                    $filter['option'] == 'like' ? '%' . $filter['text'] . '%' : $filter['text']
                ];
            }
        }

        if(!empty($custom_filter)) {
            $filter = UserLog::where($custom_filter)->with('user')->orderBy('id', 'DESC')->limit(1000)->get();
            $result['success'] = true;
            $result['count'] = $filter->count();
            $result['data'] = $filter;
            return $response->withStatus(200)->withJson($result);
        }
        
        $result['message'] = 'Invalid filters. Please specify filter(s) before proceeding.';
        return $response->withStatus(404)->withJson($result);
    }
}