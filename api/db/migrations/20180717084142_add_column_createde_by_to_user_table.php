<?php

use Phinx\Migration\AbstractMigration;

class AddColumnCreatedeByToUserTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'users';

        $table = $this->table($tbl);
        $table->addColumn('created_by', 'integer', ['after' => 'login_attempt', 'default' => 0, 'comment' => 'UserID of creator'])
              ->update();
    }
    
}
