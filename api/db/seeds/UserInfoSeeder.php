<?php


use Phinx\Seed\AbstractSeed;

class UserInfoSeeder extends AbstractSeed
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
                'id'                  => 1,
                'username'            => 'john.l@connext.solutions',
                'email'               => 'john.l@connext.solutions',
                'user_id'             => 1,
                'user_origin'         => 1,
                'employee_id'         => '261',
                'first_name'          => 'JOHN MICHAEL',
                'last_name'           => 'LAGMAN',
                'middle_name'         => 'TICIO',
                'photo'               => '261.jpg',
            ],[
                'id'                  => 2,
                'username'            => 'raymund@connext.solutions',
                'email'               => 'raymund@connext.solutions',
                'user_id'             => 2,
                'user_origin'         => 1,
                'employee_id'         => '292',
                'first_name'          => 'RAYMUND FRANCIS',
                'last_name'           => 'DELOS SANTOS',
                'middle_name'         => 'BELTRAN',
                'photo'               => 'raymund.jpg',
            ]
        ];

        $tableName = 'user_info';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
