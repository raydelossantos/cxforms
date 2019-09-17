<?php

use Phinx\Migration\AbstractMigration;

class AddColumnManageLobToLobUserTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'lob_user';

        $table = $this->table($tbl);
        $table
              ->addColumn('manage_forms', 'boolean', ['default' => 0, 'after' => 'lob_id'])
              ->addColumn('add_form', 'boolean', ['default' => 0, 'after' => 'manage_forms'])
              ->update();
    }

}
