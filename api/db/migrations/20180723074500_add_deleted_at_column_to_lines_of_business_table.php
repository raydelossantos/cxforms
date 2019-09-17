<?php

use Phinx\Migration\AbstractMigration;

class AddDeletedAtColumnToLinesOfBusinessTable extends AbstractMigration {

    public function change() {
        $tbl = 'lines_of_business';

        $table = $this->table($tbl);
        $table->addColumn('deleted_at', 'timestamp', ['after' => 'created_by', 'default' => null, 'null' => true, 'comment' => 'Date of deletion | Null otherwise'])
              ->update();
    }
}
