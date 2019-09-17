<?php

use Phinx\Migration\AbstractMigration;

class AddDeletedAtColumnToClientsTable extends AbstractMigration {

    public function change() {
        $tbl = 'clients';

        $table = $this->table($tbl);
        $table->addColumn('deleted_at', 'timestamp', ['after' => 'created_by', 'default' => null, 'null' => true, 'comment' => 'Date of deletion | Null otherwise'])
              ->update();
    }
}
