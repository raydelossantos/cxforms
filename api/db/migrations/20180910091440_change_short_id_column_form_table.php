<?php

use Phinx\Migration\AbstractMigration;

class ChangeShortIdColumnFormTable extends AbstractMigration {

    public function change() {
        $tbl = 'forms';

        $table = $this->table($tbl);

        $table->changeColumn('short_name', 'string', ['null' => true, 'default' => null])
              ->update();
    }

}
