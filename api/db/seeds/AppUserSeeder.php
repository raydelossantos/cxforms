<?php


use Phinx\Seed\AbstractSeed;

class AppUserSeeder extends AbstractSeed
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
        // $data = [
        //     [
        //         'username'  => 'michaell',
        //         'password'  => password_hash('michaell_x0hjKasL0!2', PASSWORD_DEFAULT),
        //         'status'    => '1'
        //     ],[
        //         'username'  => 'frederickd',
        //         'password'  => password_hash('frederickd_z5THlak@$#', PASSWORD_DEFAULT),
        //         'status'    => '1'
        //     ]
        // ];

        // $insert = $this->table('app_users');
        // $insert->insert($data)
        //       ->save();
    }
}
