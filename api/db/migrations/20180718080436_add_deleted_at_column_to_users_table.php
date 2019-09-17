<?php

use Phinx\Migration\AbstractMigration;

class AddDeletedAtColumnToUsersTable extends AbstractMigration {

    public function change() {
        $tbl = 'users';

        $table = $this->table($tbl);
        $table->addColumn('deleted_at', 'timestamp', ['after' => 'created_by', 'default' => null, 'null' => true, 'comment' => 'Date of deletion | Null otherwise'])
              ->update();
    }

}
