<?php

use Phinx\Migration\AbstractMigration;

class ChangeVisibilityColumnDatatypeOnFormFieldTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_fields';

        $table = $this->table($tbl);
        $table->changeColumn('visibility', 'string', ['limit' => 255, 'null' => true, 'default' => null])
              ->update();
    }

}
