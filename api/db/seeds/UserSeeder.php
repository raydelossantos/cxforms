<?php


use Phinx\Seed\AbstractSeed;

class UserSeeder extends AbstractSeed
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
                // user_id => 1
                'username'            => 'michaell',
                'is_admin'            => 1,
                'created_by'          => 0
            ],[
                // user_id => 2
                'username'            => 'glennq',
                'is_admin'            => 1,
                'created_by'          => 0
            ],[
                // user_id => 3
                'username'            => 'juluisa',
                'is_admin'            => 1,
                'created_by'          => 0
            ],[
                // user_id => 4
                'username'            => 'reynaldob',
                'is_admin'            => 1,
                'created_by'          => 0
            ],[
                // user_id => 5
                'username'            => 'aaronc',
                'is_admin'            => 0,
                'created_by'          => 0
            ],[
                // user_id => 6
                'username'            => 'jeromed',
                'is_admin'            => 0,
                'created_by'          => 0
            ],[
                // user_id => 7
                'username'            => 'rheinfalzm',
                'is_admin'            => 0,
                'created_by'          => 0
            ],
        ];

        $tableName = 'users';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
