<?php

use Phinx\Migration\AbstractMigration;

class AddSortColukmnToFormFieldsTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_fields';

        $table = $this->table($tbl);
        $table->addColumn('sort', 'integer', ['after' => 'form_id', 'null' => false, 'default' => 0])
              ->update();
    }

}
