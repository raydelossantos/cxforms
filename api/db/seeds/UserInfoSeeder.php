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
                'username'            => 'michaell',
                'email'               => 'michaell@cloudstaff.com',
                'user_id'             => 1,
                'user_origin'         => 1,
                'employee_id'         => 'CS-01909',
                'first_name'          => 'John Michael',
                'last_name'           => 'Lagman',
                'middle_name'         => 'Ticio',
            ],[
                'id'                  => 2,
                'username'            => 'glennq',
                'email'               => 'glennq@cloudstaff.com',
                'user_id'             => 2,
                'user_origin'         => 1,
                'employee_id'         => 'CS-00163',
                'first_name'          => 'Glenn',
                'last_name'           => 'Quinto',
                'middle_name'         => 'Badoria',
            ],[
                'id'                  => 3,
                'username'            => 'juluisa',
                'email'               => 'juluisa@cloudstaff.com',
                'user_id'             => 3,
                'user_origin'         => 1,
                'employee_id'         => 'CS-02059',
                'first_name'          => 'Juluis',
                'last_name'           => 'Aquino',
                'middle_name'         => 'Bagunas',
            ],[
                'id'                  => 4,
                'username'            => 'reynaldob',
                'email'               => 'reynaldo@cloudstaff.com',
                'user_id'             => 4,
                'user_origin'         => 1,
                'employee_id'         => 'CS-01295',
                'first_name'          => 'Reynaldo Jr.',
                'last_name'           => 'Batac',
                'middle_name'         => 'Sally',
            ],[
                'id'                  => 5,
                'username'            => 'aaronc',
                'email'               => 'aaronc@cloudstaff.com',
                'user_id'             => 5,
                'user_origin'         => 1,
                'employee_id'         => 'CS-01915',
                'first_name'          => 'Aaron Sean',
                'last_name'           => 'Cubacub',
                'middle_name'         => 'Buan',
            ],[
                'id'                  => 6,
                'username'            => 'jeromed',
                'email'               => 'jeromed@cloudstaff.com',
                'user_id'             => 6,
                'user_origin'         => 1,
                'employee_id'         => 'CS-00931',
                'first_name'          => 'Jerome',
                'last_name'           => 'David',
                'middle_name'         => 'Merene',
            ],[
                'id'                  => 7,
                'username'            => 'rheinfalzm',
                'email'               => 'rheinfalzm@cloudstaff.com',
                'user_id'             => 7,
                'user_origin'         => 1,
                'employee_id'         => 'CS-00307',
                'first_name'          => 'Rheinfalz',
                'last_name'           => 'Musni',
                'middle_name'         => 'Cunanan',
            ]
        ];

        $tableName = 'user_info';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
