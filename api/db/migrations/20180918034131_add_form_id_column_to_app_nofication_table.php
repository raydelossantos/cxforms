<?php

use Phinx\Migration\AbstractMigration;

class AddFormIdColumnToAppNoficationTable extends AbstractMigration {

    public function change() {
        $tbl = 'app_notifications';

        $table = $this->table($tbl);
        $table->addColumn('form_id', 'integer', ['after' => 'user_id', 'default' => 0])
              ->update();
    }

}
