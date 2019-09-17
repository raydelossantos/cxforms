<?php

use Phinx\Migration\AbstractMigration;

class DropColumnCreatedByFromUserInfoTable extends AbstractMigration {

    public function change() {
        $tbl = 'user_info';

        $table = $this->table($tbl);
        $table->removeColumn('created_by')
              ->save();
    }
}
