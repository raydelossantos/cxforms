<?php


use Phinx\Seed\AbstractSeed;

class ClientSeeder extends AbstractSeed
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
                'client_name'            => 'Connext Global Solutions.',
                'description'            => 'Your connextion to expert staffing in the cloud',
                'created_by'             => 1,
                'logo'                   => '/no_img.png'
            ],
            [
                'client_name'            => 'Company 1',
                'description'            => 'Company 1 Description',
                'created_by'             => 1,
                'logo'                   => '/no_img.png'
            ]
        ];

        $tableName = 'clients';

        if ($this->hasTable($tableName)) {
            $insert = $this->table($tableName);
            $insert->insert($data)->save();
        }
    }
}
