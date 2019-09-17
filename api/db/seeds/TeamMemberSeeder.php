<?php


use Phinx\Seed\AbstractSeed;

class TeamMemberSeeder extends AbstractSeed
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
                'team_id'                => 1,
                'user_id'                => 1
            ],[
                'team_id'                => 1,
                'user_id'                => 2
            ],[
                'team_id'                => 1,
                'user_id'                => 3
            ],[
                'team_id'                => 1,
                'user_id'                => 4
            ],[
                'team_id'                => 2,
                'user_id'                => 5
            ],[
                'team_id'                => 2,
                'user_id'                => 6
            ],[
                'team_id'                => 2,
                'user_id'                => 7
            ],
        ];

        $tableName = 'team_members';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
