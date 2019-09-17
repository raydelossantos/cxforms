<?php

namespace App\Controllers;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Http\UploadedFile as UploadedFile;

use App\Models\Client;

class ClientController {
    private $db;
    private $logger;

    /**
     * Lists of messages/constant strings for this $class
     */
    const SUCCESS = true;
    const ERROR = false;
    const SUCCESS_CREATE = 'Success. Client has been created.';
    const SUCCESS_UPDATE = 'Success. Client has been updated.';
    const SUCCESS_DELETE = 'Success, Client has been deleted.';
    const ERROR_SAVE = 'Error. Client was not saved.';
    const ERROR_UPDATE = 'Error. Client was not updated.';
    const ERROR_EXIST = 'Forbidden. Client already exists: [%s]';
    const ERROR_REQUIRED_FIELDS = 'Forbidden. Missing required parameters.';
    const ERROR_NOT_EXIST = 'Forbidden. You are updating Client that does not exists.';
    const ERROR_SAVING = 'Error. Something went wrong while saving Client.';
    const ERROR_BAD_REQUEST = 'Bad request.';
    const ERROR_DELETE = 'Error. Something went wrong while deleting Client.';
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
            $search = Client::where($query)->with('creator')->orderBy('client_name')->get();
        } else {
            $search = Client::with('creator')->orderBy('client_name')->get();
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
    public function deleted_clients(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $query_data = $request->getParams();
        $query = [];

        foreach($query_data as $q_key => $q_value) {
            $query[] = [$q_key, $q_value];
        }

        if ( !empty($query) ) {
            $search = Client::onlyTrashed()->where($query)->with('creator')->get();
        } else {
            $search = Client::onlyTrashed()->with('creator')->get();
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

        $client = Client::where('id', $params['id'])->with('creator')->first();

        if ( !empty($client) ) {
            $result['success'] = self::SUCCESS;
            $result['data'] = $client;
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
    public function get_client_full(Request $request, Response $response, $params)
    {
        $result = [];
        $result['success'] = self::ERROR;

        $client = Client::where('id', $params['id'])
                          ->with('creator')
                          ->with('lob_user')
                          ->with('user')
                          ->first();

        if ( !empty($client) ) {
            $result['success'] = self::SUCCESS;
            $result['data'] = $client;
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

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['client_name', 'description', 'created_by'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Search for existing word before processing/saving
        $search_crtieria = 'client_name';
        $search = Client::where($search_crtieria, '=', $request_data[$search_crtieria])->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_crtieria]);
            return $response->withStatus(403)->withJson($result); 
        }
        
        if ($uploadedFiles) {
            $uploadedFile = $uploadedFiles['logo'];

            // Upload the file and move to new location
            if ($uploadedFile && $uploadedFile->getError() === UPLOAD_ERR_OK) {
                $destination = __DIR__ . '/../../public/uploaded_images';

                $request_data['logo'] = '/uploaded_images/' . $this->moveUploadedFile($destination, $uploadedFile);
            }
        }

        // Save the record
        $data = Client::create(array_map('trim', $request_data));
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

        $data = Client::onlyTrashed()->find($request_data['id']);

        if ($data && $data->trashed()) {
            $data->restore();

            $result['success'] = self::SUCCESS;
            $result['message'] = 'Success. Client has been restored.';
            return $response->withStatus(200)->withJson($result);
        }

        $result['message'] = 'Error. Something went wrong while restoring client.';
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

        // Check if request is null or empty
        if (is_null($request_data) || empty($request_data) ) {
            $result['message'] = self::ERROR_BAD_REQUEST;
            return $response->withStatus(400)->withJson($result);
        }

        // Check if request has required fields
        if (!CommonController::validate(null, $request_data, ['client_name', 'description'])) {
            $result['message'] = self::ERROR_REQUIRED_FIELDS;
            return $response->withStatus(403)->withJson($result); 
        }

        // Search for existing word before processing/saving
        $search_criteria = 'client_name';
        $search = Client::where($search_criteria, $request_data[$search_criteria])->first();

        // If record exists, throw an error and abort saving
        if (count($search) > 0 && $search->id != $params['id']) {
            $result['message'] = sprintf(self::ERROR_EXIST, $request_data[$search_criteria]);
            return $response->withStatus(403)->withJson($result); 
        }

        // Update record
        $client = Client::find($params['id']);
        if ($client) {
                    
            if ($uploadedFiles) {

                $uploadedFile = $uploadedFiles['logo'];

                $destination = __DIR__ . '/../../public/uploaded_images';

                // Upload the file and move to new location
                if ($uploadedFile && $uploadedFile->getError() === UPLOAD_ERR_OK) {
                    $request_data['logo'] = '/uploaded_images/' . $this->moveUploadedFile($destination, $uploadedFile);
                }

                // delete existing logo if exists
                if ($client->logo) {

                    try {
                        $remove_file = __DIR__ . '/../../public/' . $client->logo;
                        unlink($remove_file);
                    } catch (Exception $e) {
                        // do nothing
                    }
                    
                }

            }
        
            $data = $client->update($request_data);

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

        $bot = Client::find($params['id']);

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
