<?php

use Phinx\Migration\AbstractMigration;

class AddUserIdToAdminPrivilegesTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'admin_privileges';

        $table = $this->table($tbl);
        $table->addColumn('user_id', 'integer', ['after' => 'id', 'default' => 0, 'null' => false, 'comment' => 'UserID of from Users table'])
              ->update();
    }

}
