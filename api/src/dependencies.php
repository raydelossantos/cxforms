<?php
// DIC configuration

use App\Controllers\CommonController;
use App\Controllers\UserController;
use App\Controllers\AccessLevelController;
use App\Controllers\ClientController;
use App\Controllers\FormController;
use App\Controllers\LineOfBusinessController;
use App\Controllers\FormFieldController;
use App\Controllers\TeamController;
use App\Controllers\TeamMemberController;
use App\Controllers\ClientUserController;
use App\Controllers\FormUserController;
use App\Controllers\FormTeamController;
use App\Controllers\LobUserController;
use App\Controllers\DefaultTableController;
use App\Controllers\AuthenticationController;
use App\Controllers\AdminPrivilegeController;
use App\Controllers\AppNotificationController;
use App\Controllers\MailLogController;
use App\Controllers\UserLogController;

$container = $app->getContainer();

/**
 * View renderer
 */
$container['renderer'] = function ($c) {
    $settings = $c->get('settings')['renderer'];
    return new Slim\Views\PhpRenderer($settings['template_path']);
};

/**
 * Monolog Logger
 */
$container['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $logger = new Monolog\Logger($settings['name']);
    $logger->pushProcessor(new Monolog\Processor\UidProcessor());
    $logger->pushHandler(new Monolog\Handler\StreamHandler($settings['path'], $settings['level']));
    return $logger;
};

/**
 * Eloquent ORM
 */
$container['db'] = function ($c) {
    $capsule = new \Illuminate\Database\Capsule\Manager;
    $capsule->addConnection($c['settings']['db']);

    $capsule->setAsGlobal();
    $capsule->bootEloquent();

    return $capsule;
};

/**
 * Error Handling
 */
$container['errorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        # do not show error if code is filtered
        $codesToFilter = [
            2002           // SQLSTATE unable to connect to database
        ];
        
        $return['success'] = false;
        $return['errorCode'] = $exception->getCode();

        if (!in_array($exception->getCode(), $codesToFilter)) {
            $return['message'] = $exception->getMessage();
        } else {
            // provide a generic error shown to users.
            $return['message'] = 'Unable to proceed due to internal error. Kindly report to administrator.';

            // append error message to logs/app.log
            $c->get('logger')->error($exception->getMessage());
        }
        return $response->withStatus(400)->withJson($return);
    };
};

/**
 * Override the default NOT FOUND ERROR (404)
 * ref: http://www.slimframework.com/docs/handlers/not-found.html
 */
$container['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        $return['success'] = false;
        $return['message'] = 'Error. Page not found.';
        return $c['response']->withStatus(404)->withJson($return);
    };
};

$container['App\Controllers\UserController'] = function ($c) {
    return new UserController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\CommonController'] = function ($c) {
    return new CommonController($c->get('logger'), $c->get('db'), $c->get('settings'), $c->get('token'));
};

$container['App\Controllers\AccessLevelController'] = function ($c) {
    return new AccessLevelController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\ClientController'] = function ($c) {
    return new ClientController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\FormController'] = function ($c) {
    return new FormController($c->get('logger'), $c->get('db'), $c->get('settings'), $c->get('token'));
};

$container['App\Controllers\LineOfBusinessController'] = function ($c) {
    return new LineOfBusinessController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\FormFieldController'] = function ($c) {
    return new FormFieldController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\TeamController'] = function ($c) {
    return new TeamController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\TeamMemberController'] = function ($c) {
    return new TeamMemberController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\ClientUserController'] = function ($c) {
    return new ClientUserController($c->get('logger'), $c->get('db'), $c->get('settings'), $c->get('token'));
};

$container['App\Controllers\FormUserController'] = function ($c) {
    return new FormUserController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\FormTeamController'] = function ($c) {
    return new FormTeamController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\LobUserController'] = function ($c) {
    return new LobUserController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\DefaultTableController'] = function ($c) {
    return new DefaultTableController($c->get('logger'), $c->get('db'), $c->get('settings'), $c->get('token'));
};

$container['App\Controllers\AuthenticationController'] = function ($c) {
    return new AuthenticationController($c->get('logger'), $c->get('db'), $c->get('settings'));
};

$container['App\Controllers\AdminPrivilegeController'] = function ($c) {
    return new AdminPrivilegeController($c->get('logger'), $c->get('db'));
};

$container['App\Controllers\AppNotificationController'] = function ($c) {
    return new AppNotificationController($c->get('logger'), $c->get('db'), $c->get('token'));
};

$container['App\Controllers\MailLogController'] = function ($c) {
    return new MailLogController($c->get('logger'), $c->get('db'));
};

$container['App\Controllers\UserLogController'] = function ($c) {
    return new UserLogController($c->get('logger'), $c->get('db'));
};