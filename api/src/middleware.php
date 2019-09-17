<?php
// Application middleware

use Slim\Middleware\JwtAuthentication;
use Slim\Middleware\HttpBasicAuthentication;
use Tuupola\Middleware\Cors;
use App\Models\AppUser;
use App\Models\User;
use App\Models\AdminPrivilege;
use App\Models\FormUser;
use App\Models\FormTeam;
use App\Models\TeamMember;
use App\Models\AppNotification;
use App\Models\Form;
use App\Models\LineOfBusiness;
use App\Models\ClientUser;
use App\Models\LobUser;

$container = $app->getContainer();
$app->getContainer()->get('db');

/**
 * HTTP Basic Auth for creating new API Token
 *
 * Authentication Credentials are found on
 * DB 'app_users' table
 */
$container["HttpBasicAuthentication"] = function ($container) {
    return new HttpBasicAuthentication([
        "path" => "/token",
        "relaxed" => $container->get('settings')['allowed_addresses'],
        "error" => function ($request, $response, $params) {
            $return['success'] = false;
            $return['message'] = 'Forbidden. Invalid credentials.';
            return $response->withStatus(401)->withJson($return);
        },
        "users" => get_app_users()
    ]);
};

/**
 * Get all app_users for basic authentication
 * to generate new JWT Token
 */
function get_app_users() {
        $status = 1;
        $app_users = AppUser::where('status', $status)->get();
        $users = [];

        foreach ($app_users->toArray() as $row) {
            $users[$row['username']] = $row['password'];
        }

        return $users;
}

/**
 * Token container
 */
$container["token"] = function ($container) {
    return new StdClass;
};

/**
 * JWT Middleware
 */
$container["JwtAuthentication"] = function ($container) {
    return new JwtAuthentication([
        "path" => ["/"],
        "secret" => $container->get('settings')['jwt_secret'],
        "logger" => $container["logger"],
        "attribute" => false,
        "relaxed" => $container->get('settings')['allowed_addresses'],
        "rules" => [
            new \Slim\Middleware\JwtAuthentication\RequestPathRule([
                "path" => "/",
                "passthrough" => $container->get('settings')['jwt_passthrough']
            ]),
            new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
                "passthrough" => ["OPTIONS"]
            ]),
        ],
        "error" => function ($request, $response, $params) {
            $return['success'] = false;
            $return['message'] = 'Forbidden. Invalid credentials.';
            return $response->withStatus(401)->withJson($return);
        },
        "callback" => function ($request, $response, $params) use ($container) {
            $container["token"] = $params['decoded'];
        },
    ]);
};

$tokenAuth = function ($request, $response, $next)  use ($container) {
    // get ACL from settings
    $acl_settings = $container->get('settings')['ACL'];

    // get user from token
    $user = $container->get('token')->sub->user->user;

    // get path (e.g. form/field/admin/user)
    $_paths  = explode('/', $request->getUri()->getPath());
    $_path  = !empty($_paths[1]) ? $_paths[1] : '';

    // catch if request is from public forms
    if ($_path === 'public') {
        $form = $container->get('token')->sub->user->form;

        $search = Form::find($form->id);

        if (!$search || $search->form_type !== 1) {
            $return['success']  = false;
            $return['message']  = 'Forbidden. This form is not writable at this moment. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        // $container->get('logger')->info();

        if ($_paths[2] === 'default') {

            if ($_paths[3] != $search->id) {
                $return['success']  = false;
                $return['message']  = 'Forbidden. You might be saving to different. Kindly restart the process. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }
        }
        
        return $next($request, $response);
    }

    // extract method used (e.g. GET/POST/PUT/DELETE)
    $method = $request->getMethod();  

    if ($user->is_admin) {
        // fetch from DB the Admin Privileges of the User
        $admin_privileges = AdminPrivilege::where('user_id', $user->id)->first();

        if (!$admin_privileges) {
            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        // based on admin privilege, delegate ACL to different routes
        $acl['user']            = $acl_settings['user'][$admin_privileges->manage_users];
        $acl['client']          = $acl_settings['client'][$admin_privileges->manage_clients];
        $acl['admin']           = $acl_settings['admin'][$admin_privileges->manage_admins];
        $acl['privilege']       = $acl_settings['admin'][$admin_privileges->manage_admins];
        $acl['team']            = $acl_settings['team'][$admin_privileges->manage_teams];
        $acl['member']          = $acl_settings['member'][$admin_privileges->manage_teams];
        $acl['lob']             = $acl_settings['lob'][$admin_privileges->manage_lob];
        $acl['log']             = $acl_settings['admin'][$admin_privileges->manage_admins];

        // for stats (admin dashboard)
        $acl['common']          = ['GET', 'POST', 'DELETE', 'PUT'];

        // notification - default permission for all users
        $acl['notification']    = ['GET', 'PUT', 'DELETE'];
        $acl['search']          = ['POST'];

        // for home/front-end functions
        $acl['field']           = $acl_settings['field'][$admin_privileges->manage_forms];
        $acl['form']            = $acl_settings['form'][$admin_privileges->manage_forms];
        $acl['permission']      = $acl_settings['permission'][$admin_privileges->manage_forms];
        $acl['default']         = $acl_settings['default'][$admin_privileges->manage_forms];
        $acl['export']          = $acl_settings['export'][$admin_privileges->manage_forms];    // for exporting records

        if (in_array($method, $acl[$_path])) {
            if (isset($_paths[3]) && $_paths[3] == 'acl') {
                $response = $next($request, $response);
                $body = json_decode($response->getBody());
                $body->acl = $acl;
                return $response->withStatus(200)->withJson($body);
            } else {
                return $next($request, $response);
            }
        } else {
            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }
    } else {
        // check if user is still existing from db
        $user_exist = User::find($user->id);
        if (!$user_exist) {
            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        // Default ACL Permissions
        $acl['user']            = ['GET'];
        $acl['client']          = ['GET'];
        $acl['team']            = ['GET'];
        $acl['member']          = ['GET'];
        $acl['lob']             = ['GET'];
        $acl['log']             = [];

        // notification - default permission for all users
        $acl['notification']   = ['GET', 'PUT', 'DELETE'];

        if (isset($acl[$_path]) && in_array($method, $acl[$_path])) {
            return $next($request, $response);
        }

        // check if request is to get user dashboard (bypass permissions check)
        // get dashboard using token user id
        if ($_paths[1] == 'common' && $_paths[2] == 'user') {
            // modify request to include user_id in the request
            $request = $request->withAttribute('user_id', $user->id);
            return $next($request, $response);
        }

        // get form_id from route
        $form_id  = !empty($_paths[2]) ? $_paths[2] : '';

        // catch if request is to add a new form
        if ($_path == 'form' && $form_id == '' && $method == 'POST') {
            $req = $request->getParsedBody();

            $_lob_user = LobUser::where('lob_id', $req['lob_id'])
                                ->where('user_id', $user->id)
                                ->get()
                                ->toArray();

            $_lob = LineOfBusiness::find($req['lob_id']);

            $_client_admin = ClientUser::where('client_id', $_lob->client_id)
                                       ->where('user_id', $user->id)
                                       ->get()
                                       ->toArray();

            if ($_client_admin) {
                return $next($request, $response);
            } elseif ($_lob_user) {
                return $next($request, $response);
            }
        }

        // catch if no form is specified in the request
        if ($form_id == '' || $_path == '') {
            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        /******************************************************************
         * ACL FOR 
         *  - CLIENT ADMIN
         *  - LOB USER
         *****************************************************************/
        $_form = Form::find($form_id);

        if (!$_form) {
            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        $_lob = LineOfBusiness::find($_form->lob_id);
        
        if (!$_lob) {
            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        $_lob_user = LobUser::where('lob_id', $_lob->id)
                            ->where('user_id', $user->id)
                            ->get()
                            ->toArray();

        $_client_admin = ClientUser::where('client_id', $_lob->client_id)
                                   ->where('user_id', $user->id)
                                   ->get()
                                   ->toArray();
        $result = null;
        $acl['form'] = [];
        
        if ($_client_admin) {

            $acl['default']         = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['search']          = ['POST'];
            $acl['field']           = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['form']            = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['permission']      = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['export']          = ['POST'];

            $add_record = true;
            $configure_list = true;
            $export_data = true;
            $access_control = true;
            $view_own = true;
            $edit_own = true;
            $edit_all = true;

        } elseif ($_lob_user) {

            $acl['default']         = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['search']          = ['POST'];
            $acl['field']           = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['form']            = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['permission']      = ['GET', 'POST', 'DELETE', 'PUT'];
            $acl['export']          = ['POST'];

            $add_record = true;
            $configure_list = true;
            $export_data = true;
            $access_control = true;
            $view_own = true;
            $edit_own = true;
            $edit_all = true;

        } else {

            /**
             * Check if user has permission to the form
             * Search FORM USER Permission (First Priority)
             */
            $result = FormUser::where('form_id', $form_id)->where('user_id', $user->id)->get();
            if (count($result) == 0) {
                /**
                 * Check if user has permission to the form via TEAM PERMISSION
                 * Search FORM TEAM Permission (Second Priority)
                 */

                // get all teams a user is a member
                $teams = TeamMember::select('team_id')->distinct('team_id')->where('user_id', $user->id)->get()->toArray();

                // check if a team  is included in the form permission
                // $form_teams = FormTeam::where('form_id', $form_id)->whereIn('team_id', $teams)->orderBy('id', 'ASC')->first();

                // multiple team permissions compound permissions
                $form_teams = FormTeam::where('form_id', $form_id)->whereIn('team_id', $teams)->orderBy('id', 'ASC')->get();

                if ($form_teams) $result = $form_teams;
            }

            /**
             * Process permission retrieved in this block
             * This is a multi step checking of access controls.
             * Kindly give a few minutes to check each line before editing.
             */
            if ($result) {
                $params = [];

                $view_own_only = true;
                $edit_own_only = true;

                $add_record = false;
                $configure_list = false;
                $export_data = false;
                $access_control = false;
                $view_own = false;
                $edit_own = false;
                $edit_all = false;
                
                foreach($result as $res) {

                    if ($res->view_all) $view_own_only = false;
                    if ($res->edit_all) $edit_own_only = false;

                    if ($res->add_record) $add_record = true;
                    if ($res->configure_list) $configure_list = true;
                    if ($res->access_control) $access_control = true;
                    if ($res->export_data) $export_data = true;
                    if ($res->view_own || $res->view_all) $view_own = true;
                    if ($res->edit_own) $edit_own = true;
                    if ($res->edit_all) $edit_all = true;

                }

                $acl['default']         = ($add_record) ? ['POST'] : ['NO_ADD'];                           // default permission is to add record to form
                $acl['search']          = [];                                                              // permission to filter view records
                $acl['field']           = ($configure_list) ? ['GET', 'POST', 'DELETE', 'PUT'] : ['GET'];  // permission to edit form/fields
                $acl['form']            = ($configure_list) ? ['GET', 'POST', 'DELETE', 'PUT'] : ['GET'];  // permission to edit form/fields
                $acl['permission']      = ($access_control) ? ['GET', 'POST', 'DELETE', 'PUT'] : [];       // permission to modify permissions
                $acl['export']          = ($export_data)    ? ['POST'] : [];                               // permission to use export data tool

                if ($view_own) {
                    // view permission
                    array_push($acl['default'], 'GET');
                    array_push($acl['search'], 'POST');
                }
 
                if ($edit_all) {
                    // edit all permission
                    array_push($acl['default'], 'PUT');
                    if (!in_array('POST', $acl['default'])) array_push($acl['default'], 'POST');
                    array_push($acl['default'], 'DELETE');
                } elseif ($edit_own) {
                    // edit own permission
                    array_push($acl['default'], 'PUT');
                    if (!in_array('POST', $acl['default'])) array_push($acl['default'], 'POST');
                    array_push($acl['default'], 'PUT_OWN');
                    array_push($acl['default'], 'DELETE');
                }
                
                if ($view_own_only) {
                    $request = $request->withAttribute('user_id_from_middleware', $user->id);
                }

                if ($edit_own_only && $edit_own) {
                    $request = $request->withAttribute('edit_user_id_from_middleware', $user->id);
                }

            } else {
                $return['success']  = false;
                $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                return $response->withStatus(401)->withJson($return);
            }
        }

        /**
         * Test the ACL if the request should connect or not
         */
        if (in_array($method, $acl[$_path])) {
            if (isset($_paths[3]) && $_paths[3] == 'acl') {
                $response = $next($request, $response);
                $body = json_decode($response->getBody());
                $body->acl = $acl;
                return $response->withStatus(200)->withJson($body);
            } else {
                
                // catch if user has no create record permission
                if ($_path == 'default' && count($_paths) == 3) {
                    if ($method == 'POST' && $result && !$add_record) {
                        $return['success']  = false;
                        $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                        return $response->withStatus(401)->withJson($return);
                    }
                }

                // test if request belongs to the following:
                // export_page | form_settings_page | permission_page | view_list_page
                $pages = ['export_page', 'settings_page', 'permission_page', 'view_page'];
                if ($_path == 'form' && isset($_paths[3]) && in_array($_paths[3], $pages)) {

                    if (
                        $_paths[3] == 'view_page' && !$view_own ||
                        $_paths[3] == 'permission_page' && !$access_control ||
                        $_paths[3] == 'export_page' && !$export_data ||
                        $_paths[3] == 'settings_page' && !$configure_list
                       ) {
                        $return['success']  = false;
                        $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
                        return $response->withStatus(401)->withJson($return);
                    }
                }

                return $next($request, $response);
            }
        } else {

            /**
             * Final checking if request is updating a record
             * for user tag, this block should bypass if credentials matched
             */
            if ($_path == 'default' && ($method == 'GET' || $method == 'POST')) {
                if (isset($_paths[2]) && isset($_paths[4])) {
                    $app_notif = AppNotification::where('user_id', $user->id)
                                                ->where('hash', $_paths[4])
                                                ->where('form_id', $_paths[2])
                                                ->where('record_id', $_paths[3])
                                                ->first();

                    if ($app_notif) {
                        return $next($request, $response);
                    }
                }
            }

            $return['success']  = false;
            $return['message']  = 'Forbidden. Invalid credentials. If you think this is wrong, please contact Administrator.';
            return $response->withStatus(401)->withJson($return);
        }

        // FORM Permission: No User | No Team
        $return['success'] = false;
        $return['message'] = 'Forbidden. You are accessing a restricted resource. If you think this is wrong, please contact Administrator.';
        return $response->withStatus(401)->withJson($return);
    }

};

// $app->add("TokenAuthAdmin");
// $app->add("HttpBasicAuthentication");
$app->add("JwtAuthentication");

$app->add(new Cors([
    // "logger" => $container["logger"],
    "origin" => ["*"],
    "methods" => ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "headers.allow" => ["X-Requested-With", "Content-Type", "Accept", "Origin", "Authorization"],
    "headers.expose" => ["Authorization", "Etag", "Access-Control-Allow-Credentials"],
    "credentials" => true,
    "cache" => 60,
    "error" => function ($request, $response, $arguments) {
        return new UnauthorizedResponse($arguments["message"], 401);
    }
]));

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

$app->add(\adrianfalleiro\SlimCLIRunner::class);
