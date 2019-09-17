<?php


use Phinx\Seed\AbstractSeed;

class LobSeeder extends AbstractSeed
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
                'lob_name'               => 'CS Core and API Team',
                'description'            => 'Internal Development Services',
                'created_by'             => 1,
                'client_id'              => 1
            ],[
                'lob_name'               => 'CS QA Team',
                'description'            => 'Internal Quality Assurance Services',
                'created_by'             => 1,
                'client_id'              => 1
            ],[
                'lob_name'               => 'CS Human Resource',
                'description'            => 'Human Resources Department',
                'created_by'             => 1,
                'client_id'              => 1
            ],[
                'lob_name'               => 'CS Mobile Development',
                'description'            => 'Internal Mobile Development Services',
                'created_by'             => 1,
                'client_id'              => 1
            ],[
                'lob_name'               => 'CS Training & Professional',
                'description'            => 'Training and Professional Services',
                'created_by'             => 1,
                'client_id'              => 1
            ],[
                'lob_name'               => 'PH Development',
                'description'            => 'Philippine Development Team',
                'created_by'             => 1,
                'client_id'              => 2
            ]
        ];

        $tableName = 'lines_of_business';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
