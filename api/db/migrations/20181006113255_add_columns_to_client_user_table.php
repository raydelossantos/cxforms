<?php

use Phinx\Migration\AbstractMigration;

class AddColumnsToClientUserTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'client_user';

        $table = $this->table($tbl);
        $table
              ->addColumn('manage_info', 'boolean', ['default' => 0, 'after' => 'client_id'])
              ->addColumn('manage_lob', 'boolean', ['default' => 0, 'after' => 'manage_info'])
              ->addColumn('manage_forms', 'boolean', ['default' => 0, 'after' => 'manage_lob'])
              ->update();
    }

}
