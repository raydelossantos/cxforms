<?php


use Phinx\Seed\AbstractSeed;

class TeamSeeder extends AbstractSeed
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
                'team_name'              => 'Development Team',
                'team_code'              => 'DEVS',
                'description'            => 'developers',
                'location'               => 'CRK',
                'created_by'             => 1,
                'client_id'              => 0
            ],[
                'team_name'              => 'Team2',
                'team_code'              => 'TEAM2',
                'description'            => 'Team',
                'location'               => 'CRK',
                'created_by'             => 1,
                'client_id'              => 2
            ]
        ];

        $tableName = 'teams';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
