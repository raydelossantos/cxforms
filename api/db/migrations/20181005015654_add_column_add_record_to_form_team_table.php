<?php

use Phinx\Migration\AbstractMigration;

class AddColumnAddRecordToFormTeamTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'form_team';

        $table = $this->table($tbl);
        $table
              ->addColumn('add_record', 'boolean', ['default' => false, 'after' => 'lob_id'])
              ->update();
    }

}
