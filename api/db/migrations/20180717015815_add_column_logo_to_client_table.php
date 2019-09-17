<?php

use Phinx\Migration\AbstractMigration;

class AddColumnLogoToClientTable extends AbstractMigration {

    public function change() {
        // create the table
        $tbl = 'clients';

        $table = $this->table($tbl);
        $table->addColumn('logo', 'string', ['after' => 'description', 'default' => ''])
              ->save();
    }

}
