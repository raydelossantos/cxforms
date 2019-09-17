<?php

use Phinx\Migration\AbstractMigration;

class AddDeletedColumnToAppNoficationTable extends AbstractMigration {

    public function change() {
        $tbl = 'app_notifications';

        $table = $this->table($tbl);
        $table->addColumn('deleted', 'boolean', ['after' => 'is_opened', 'default' => false])
              ->update();
    }

}
