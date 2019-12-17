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
                'username'            => 'john.l@connext.solutions',
                'is_admin'            => 1,
                'created_by'          => 0
            ],[
                // user_id => 2
                'username'            => 'raymund@connext.solutions',
                'is_admin'            => 1,
                'created_by'          => 0
            ]
        ];

        $tableName = 'users';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
