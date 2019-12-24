<?php


use Phinx\Seed\AbstractSeed;

class AdminPrivilegeSeeder extends AbstractSeed
{
    /**
     * Run Method.
     *
     * Write your database seeder using this method.
     *
     * More information on writing seeders is available here:
     * http://docs.phinx.org/en/latest/seeding.html
     */
    public function run()
    {
        $data = [
            [
                // SUPER ADMIN
                'user_id'           => 1,
                'username'          => 'john.l@connext.solutions',
                'display_name'      => 'Super Admin',
                'manage_admins'     => 2,
                'manage_clients'    => 2,
                'manage_teams'      => 2,
                'manage_users'      => 2,
                'manage_lob'        => 2,
                'manage_forms'      => 2
            ],[
                // SUPER ADMIN
                'user_id'           => 2,
                'username'          => 'raymund@connext.solutions',
                'display_name'      => 'Super Admin',
                'manage_admins'     => 2,
                'manage_clients'    => 2,
                'manage_teams'      => 2,
                'manage_users'      => 2,
                'manage_lob'        => 2,
                'manage_forms'      => 2
            ]
        ];

        $tableName = 'admin_privileges';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}