<?php

use Slim\Http\Request;
use Slim\Http\Response;

/**
 * Include all Controllers
 */
use App\Controllers\AppUserController;
use App\Controllers\UserController;
use App\Controllers\CommonController;
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

$app->add(function ($request, $response, $next) {
    $response = $next($request, $response);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

/**
 * ------------- Begin Routes Here ------------------------
 */
$app->get('/', function ($request, $response, $params) {
    return $this->renderer->render($response, 'index.phtml', $params);
});

$app->group('/common', function () {
    $this->get('/stats',                                                    CommonController::class.':get_admin_dashboard');
    $this->get('/user',                                                     CommonController::class.':get_user_dashboard');
    $this->get('/user/clients',                                             CommonController::class.':get_user_client_dashboard');
    $this->get('/user/{client_id:[0-9]+}/forms',                            CommonController::class.':get_user_form_dashboard');
})->add($tokenAuth);

$app->group('/log', function () {
    $this->get('/mail',                                                     MailLogController::class.':get_all');
    $this->post('/mail/filter',                                             MailLogController::class.':filter');
    $this->get('/user',                                                     UserLogController::class.':get_all');
    $this->post('/user/filter',                                             UserLogController::class.':filter');
})->add($tokenAuth);

$app->group('/user', function () {
    $this->get('',                                                          UserController::class.':get_all');
    $this->get('/{id:[0-9]+}',                                              UserController::class.':get');
    $this->post('',                                                         UserController::class.':create');
    $this->put('/{id:[0-9]+}',                                              UserController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           UserController::class.':delete');

    /** USER ACCOUNTS */
    $this->post('/create',                                                  UserController::class.':create_user');      // create user & userinfo
    $this->post('/batch',                                                   UserController::class.':create_batch');     // sync user from api
    $this->get('/user_info',                                                UserController::class.':user_info');        // get users with userinfo
    $this->get('/deleted',                                                  UserController::class.':deleted_users');    // create an administrator acct with admin privileges
    $this->post('/restore',                                                 UserController::class.':restore');          // restores deleted user
    $this->post('/unblock',                                                 UserController::class.':unblock');          // unblocks login (login_attempt = 0)
    $this->get('/invalid',                                                  UserController::class.':invalid');          // get all invalid logins greater than 0
    $this->post('/import',                                                  UserController::class.':import_csv');

    /** GET USERS FOR DROPDOWN */
    $this->get('/form/{id:[0-9]+}',                                         UserController::class.':get_all_user_not_in_form'); // get all user accounts not in form ID to add to permission
    $this->get('/client/{id:[0-9]+}',                                       UserController::class.':get_all_user_not_in_client'); // get all user accounts not in form ID to add to permission
    $this->get('/lob/{id:[0-9]+}',                                          UserController::class.':get_all_user_not_in_lob'); // get all user accounts not in form ID to add to permission
})->add($tokenAuth);

$app->group('/admin', function () {
    /** ADMIN ACCOUNTS is_admin = 1 */
    $this->post('',                                                         UserController::class.':admin_create');     // create an administrator acct with admin privileges
    $this->get('/{id:[0-9]+}',                                              UserController::class.':admin_get');        // get an administrator acct with admin privileges
    $this->get('/admin_info',                                               UserController::class.':admin_info');       // get all admin accounts with user info where
    $this->delete('/{id:[0-9]+}',                                           UserController::class.':admin_delete');     // delete an administrator acct with admin privileges
    $this->put('/{id:[0-9]+}',                                              UserController::class.':admin_update');     // update an administrator privileges
})->add($tokenAuth);

$app->group('/client', function () {
    $this->get('',                                                          ClientController::class.':get_all');
    $this->get('/{id:[0-9]+}',                                              ClientController::class.':get');
    $this->get('/{id:[0-9]+}/full',                                         ClientController::class.':get_client_full');
    $this->post('',                                                         ClientController::class.':create');
    $this->post('/{id:[0-9]+}',                                             ClientController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           ClientController::class.':delete');
    $this->get('/deleted',                                                  ClientController::class.':deleted_clients');
    $this->post('/restore',                                                 ClientController::class.':restore');

    /** client user management routes */
    $this->get('/admin',                                                    ClientUserController::class.':get_all');
    $this->post('/admin',                                                   ClientUserController::class.':create');
    $this->put('/admin/batch/{client_id:[0-9]+}',                           ClientUserController::class.':update_batch');
    $this->delete('/admin/{id:[0-9]+}',                                     ClientUserController::class.':delete');

    /** lob user management routes */
    $this->get('/lob_user',                                                 LobUserController::class.':get_all');
    $this->post('/lob_user',                                                LobUserController::class.':create');
    $this->put('/lob/batch/{lob_id:[0-9]+}',                                LobUserController::class.':update_batch');
    $this->delete('/lob_user/{id:[0-9]+}',                                  LobUserController::class.':delete');
})->add($tokenAuth);

$app->group('/form', function () {
    $this->get('',                                                          FormController::class.':get_all');
    $this->get('/{id:[0-9]+}',                                              FormController::class.':get');
    // $this->get('/{id:[A-Za-z0-9_]+}',                                        FormController::class.':get_form_by_table_name');
    $this->post('',                                                         FormController::class.':create');
    $this->put('/{id:[0-9]+}',                                              FormController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           FormController::class.':delete');
    $this->get('/{id:[0-9]+}/acl',                                          FormController::class.':get');
    $this->get('/deleted',                                                  FormController::class.':get_all_deleted');
    $this->post('/restore',                                                 FormController::class.':restore');
    $this->get('/{id:[0-9]+}/settings_page',                                FormController::class.':get');
    $this->get('/{id:[0-9]+}/export_page',                                  FormController::class.':get');
    $this->get('/{id:[0-9]+}/permission_page',                              FormController::class.':get_permission');
    $this->get('/{id:[0-9]+}/view_page',                                    FormController::class.':get');
})->add($tokenAuth);

$app->group('/lob', function () {
    $this->get('',                                                          LineOfBusinessController::class.':get_all');
    $this->get('/{id:[0-9]+}',                                              LineOfBusinessController::class.':get');
    $this->post('',                                                         LineOfBusinessController::class.':create');
    $this->put('/{id:[0-9]+}',                                              LineOfBusinessController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           LineOfBusinessController::class.':delete');
    $this->get('/client',                                                   LineOfBusinessController::class.':get_all_client');
    $this->get('/deleted',                                                  LineOfBusinessController::class.':get_all_deleted');
    $this->post('/restore',                                                 LineOfBusinessController::class.':restore');
    $this->get('/{client_id:[0-9]+}/user',                                  LineOfBusinessController::class.':get_lob_user');
})->add($tokenAuth);

$app->group('/field', function () {
    $this->get('/{form_id:[0-9]+}',                                         FormFieldController::class.':get_all');
    $this->get('/{form_id:[0-9]+}/{id:[0-9]+}',                             FormFieldController::class.':get');
    $this->post('/{form_id:[0-9]+}',                                        FormFieldController::class.':create');
    $this->put('/{form_id:[0-9]+}/{id:[0-9]+}',                             FormFieldController::class.':update');
    $this->delete('/{form_id:[0-9]+}/{id:[0-9]+}',                          FormFieldController::class.':delete');
    $this->post('/{form_id:[0-9]+}/sort',                                   FormFieldController::class.':sort');
    $this->get('/{form_id:[0-9]+}/get_deleted',                             FormFieldController::class.':get_deleted');
    $this->put('/{form_id:[0-9]+}/restore',                                 FormFieldController::class.':restore');
})->add($tokenAuth);

$app->group('/team', function () {
    $this->get('',                                                          TeamController::class.':get_all');
    $this->get('/{id:[0-9]+}',                                              TeamController::class.':get');
    $this->post('',                                                         TeamController::class.':create');
    $this->put('/{id:[0-9]+}',                                              TeamController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           TeamController::class.':delete');
    $this->get('/deleted',                                                  TeamController::class.':get_all_deleted');
    $this->post('/restore',                                                 TeamController::class.':restore');
    $this->get('/form/{id:[0-9]+}',                                         TeamController::class.':get_all_not_in_form');
    $this->get('/user/{id:[0-9]+}',                                         TeamMemberController::class.':get_all_teams_by_userid');
})->add($tokenAuth);

$app->group('/member', function () {
    $this->get('',                                                          TeamMemberController::class.':get_all');
    $this->get('/users',                                                    TeamMemberController::class.':get_all_users');
    $this->get('/{id:[0-9]+}',                                              TeamMemberController::class.':get');
    $this->post('',                                                         TeamMemberController::class.':create');
    $this->put('/{id:[0-9]+}',                                              TeamMemberController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           TeamMemberController::class.':delete');
})->add($tokenAuth);

$app->group('/privilege', function () {
    $this->get('',                                                          AdminPrivilegeController::class.':get_all');
    $this->get('/{id:[0-9]+}',                                              AdminPrivilegeController::class.':get');
    $this->post('',                                                         AdminPrivilegeController::class.':create');
    $this->put('/{id:[0-9]+}',                                              AdminPrivilegeController::class.':update');
    $this->delete('/{id:[0-9]+}',                                           AdminPrivilegeController::class.':delete');
})->add($tokenAuth);

$app->group('/permission', function () {
    $this->get('/{form_id:[0-9]+}/user',                                    FormUserController::class.':get_all');
    $this->get('/{form_id:[0-9]+}/user/{id:[0-9]+}',                        FormUserController::class.':get');
    $this->post('/{form_id:[0-9]+}/user',                                   FormUserController::class.':create');
    $this->put('/{form_id:[0-9]+}/user/{id:[0-9]+}',                        FormUserController::class.':update');
    $this->put('/{form_id:[0-9]+}/user/batch',                              FormUserController::class.':update_batch');
    $this->delete('/{form_id:[0-9]+}/user/{id:[0-9]+}',                     FormUserController::class.':delete');

    $this->get('/{form_id:[0-9]+}/team',                                    FormTeamController::class.':get_all');
    $this->get('/{form_id:[0-9]+}/team/{id:[0-9]+}',                        FormTeamController::class.':get');
    $this->post('/{form_id:[0-9]+}/team',                                   FormTeamController::class.':create');
    $this->put('/{form_id:[0-9]+}/team/{id:[0-9]+}',                        FormTeamController::class.':update');
    $this->put('/{form_id:[0-9]+}/team/batch',                              FormTeamController::class.':update_batch');
    $this->delete('/{form_id:[0-9]+}/team/{id:[0-9]+}',                     FormTeamController::class.':delete');
})->add($tokenAuth);

/**
 * Default Table routes.
 * These routes are used to access dynamic tables.
 */
$app->group('/default', function () {
    $this->get('/{form_id:[0-9]+}',                                         DefaultTableController::class.':get_all');
    $this->get('/{form_id:[0-9]+}/{id:[0-9]+}',                             DefaultTableController::class.':get');
    $this->get('/{form_id:[0-9]+}/{id:[0-9]+}/{hash:[a-zA-Z0-9]+}',         DefaultTableController::class.':get_record_view');
    $this->post('/{form_id:[0-9]+}',                                        DefaultTableController::class.':create');
    $this->post('/{form_id:[0-9]+}/{id:[0-9]+}',                            DefaultTableController::class.':update');
    $this->post('/{form_id:[0-9]+}/{id:[0-9]+}/{hash:[a-zA-Z0-9]+}',        DefaultTableController::class.':update_record');
    $this->delete('/{form_id:[0-9]+}/{id:[0-9]+}',                          DefaultTableController::class.':delete');
    $this->delete('/{form_id:[0-9]+}/{id:[0-9]+}/a/{a_id:[0-9]+}',          DefaultTableController::class.':delete_attachment');
    // get tags for a certain record
    $this->get('/{form_id:[0-9]+}/{id:[0-9]+}/tags/get',                    DefaultTableController::class.':get_record_tag');
    $this->delete('/{form_id:[0-9]+}/{id:[0-9]+}/tags/{tag_id:[0-9]+}',     DefaultTableController::class.':delete_record_tag');
})->add($tokenAuth);

/**
 * Separated route to create
 * a new ACL For Export
 */
$app->group('/export', function () { 
    $this->post('/{form_id:[0-9]+}',                                        DefaultTableController::class.':export');
})->add($tokenAuth);

/**
 * Separated route to create
 * a new ACL For Searching record
 */
$app->group('/search', function () {
    $this->post('/{form_id:[0-9]+}',                                        DefaultTableController::class.':search');
})->add($tokenAuth);

/**
 * new routes for notifications
 * ACL is for GET & PUT only set on middleware
 * all users have the same permissions
 */
$app->group('/notification', function () {
    $this->get('',                                                          AppNotificationController::class.':get_all');
    $this->put('/{id:[0-9]+}',                                              AppNotificationController::class.':mark_as_read');
    $this->put('/mark_all',                                                 AppNotificationController::class.':mark_all_as_read');
    $this->delete('/{id:[0-9]+}',                                           AppNotificationController::class.':delete');
    $this->delete('/delete_all',                                            AppNotificationController::class.':delete_all');
})->add($tokenAuth);

/**
 * JWT Token creation route
 */
$app->post("/token",                                                        CommonController::class.':token');

/**
 * Login routes
 */
$app->group('/auth', function () {
    $this->post('/login',                                                   AuthenticationController::class.':ldap_login');
    $this->get('/google',                                                   AuthenticationController::class.':google_login');
    $this->get('/unblock/{username:[a-zA-Z]+}/{hash:[a-zA-Z0-9]+}',         AuthenticationController::class.':unblock');
    $this->get('/wp/{id:[a-zA-Z0-9]+}',                                     AuthenticationController::class.':wp_login');
});

/**
 * Public Form routes
 * intended for public (workpattern user)
 */
$app->group('/public', function () {
    $this->get('/form/{hash:[a-zA-Z0-9]+}',                                 FormController::class.':get_form_by_hash');
    $this->get('/member',                                                   TeamMemberController::class.':get_all');
    $this->post('/default/{form_id:[0-9]}',                                 DefaultTableController::class.':create');
})->add($tokenAuth);

/**
 * Test routes
 */
$app->get("/test", function ($request, $response, $params) {
    $result['success'] = true;
    $result['message'] = 'Hello world!';

    return $response->withStatus(200)->withJson($result);
});

$app->get("/test_insecure", function ($request, $response, $params) {
    $result['success'] = true;
    $result['message'] = 'Hello world!';

    return $response->withStatus(200)->withJson($result);
});

// $app->group('/access_level', function () {
//     $this->get('',                      AccessLevelController::class.':get_all');
//     $this->get('/{id:[0-9]+}',          AccessLevelController::class.':get');
//     $this->post('',                     AccessLevelController::class.':create');
//     $this->put('/{id:[0-9]+}',          AccessLevelController::class.':update');
//     $this->delete('/{id:[0-9]+}',       AccessLevelController::class.':delete');
// });

// $app->group('/app_user', function () {
//     $this->get('',                      AppUserController::class.':get_all');
//     $this->get('/{id:[0-9]+}',          AppUserController::class.':get');
//     $this->post('',                     AppUserController::class.':create');
//     $this->put('/{id:[0-9]+}',          AppUserController::class.':update');
//     $this->delete('/{id:[0-9]+}',       AppUserController::class.':delete');
// });

// $app->group('/client_user', function () {
//     $this->get('',                      ClientUserController::class.':get_all');
//     $this->get('/{id:[0-9]+}',          ClientUserController::class.':get');
//     $this->post('',                     ClientUserController::class.':create');
//     $this->put('/{id:[0-9]+}',          ClientUserController::class.':update');
//     $this->delete('/{id:[0-9]+}',       ClientUserController::class.':delete');
// });

// $app->group('/form_user', function () {
//     $this->get('',                      FormUserController::class.':get_all');
//     $this->get('/{id:[0-9]+}',          FormUserController::class.':get');
//     $this->post('',                     FormUserController::class.':create');
//     $this->put('/{id:[0-9]+}',          FormUserController::class.':update');
//     $this->delete('/{id:[0-9]+}',       FormUserController::class.':delete');
// });

// $app->group('/lob_user', function () {
//     $this->get('',                      LobUserController::class.':get_all');
//     $this->get('/{id:[0-9]+}',          LobUserController::class.':get');
//     $this->post('',                     LobUserController::class.':create');
//     $this->put('/{id:[0-9]+}',          LobUserController::class.':update');
//     $this->delete('/{id:[0-9]+}',       LobUserController::class.':delete');
// });