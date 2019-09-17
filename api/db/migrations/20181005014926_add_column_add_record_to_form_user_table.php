<?php

use Phinx\Migration\AbstractMigration;

class AddColumnAddRecordToFormUserTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_user';

        $table = $this->table($tbl);
        $table
              ->addColumn('add_record', 'boolean', ['default' => false, 'after' => 'lob_id'])
              ->update();
    }

}
