<?php

use Phinx\Migration\AbstractMigration;

class AddColumnRecordIdToAppNotificationsTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'app_notifications';

        $table = $this->table($tbl);
        $table
              ->addColumn('record_id', 'integer', ['default' => 0, 'after' => 'form_id'])
              ->update();
    }

}
