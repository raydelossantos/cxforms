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
                'lob_name'               => 'ShareShop Dev Team',
                'description'            => 'Internal Development Services',
                'created_by'             => 1,
                'client_id'              => 1
            ]
        ];

        $tableName = 'lines_of_business';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
