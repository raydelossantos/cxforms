<?php

use Phinx\Migration\AbstractMigration;

class ChangeVisibilityColumnFromFormFieldsTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_fields';

        $table = $this->table($tbl);
        $table->changeColumn('visibility', 'date', ['null' => true, 'default' => null])
              ->update();
    }

}
