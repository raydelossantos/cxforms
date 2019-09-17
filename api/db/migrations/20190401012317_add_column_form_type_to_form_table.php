<?php

use Phinx\Migration\AbstractMigration;

class AddColumnFormTypeToFormTable extends AbstractMigration {

    public function change() {
        $tbl = 'forms';

        $table = $this->table($tbl);
        $table
              ->addColumn('form_type', 'integer', ['after' => 'hash', 'default' => 0])
              ->update();
    }

}
