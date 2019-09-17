<?php

use Phinx\Migration\AbstractMigration;

class AddColumnHashToFormTable extends AbstractMigration {

    public function change() {
        $tbl = 'forms';

        $table = $this->table($tbl);
        $table
              ->addColumn('hash', 'string', ['limit' => 100, 'after' => 'max_records_in_list_view', 'default' => null])
              ->addIndex('hash', ['unique' => true])
              ->update();
    }

}
