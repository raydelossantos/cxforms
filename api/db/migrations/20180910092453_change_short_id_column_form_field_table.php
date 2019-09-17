<?php

use Phinx\Migration\AbstractMigration;

class ChangeShortIdColumnFormFieldTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_fields';

        $table = $this->table($tbl);

        $table->changeColumn('short_id', 'string', ['null' => true, 'default' => null])
              ->update();
    }

}
