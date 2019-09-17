<?php

use Phinx\Migration\AbstractMigration;

class AddColumnResetHashToUsersTable extends AbstractMigration {
        
    public function change() {
        $tbl = 'users';

        $table = $this->table($tbl);
        $table
              ->addColumn('reset_hash', 'string', ['null' => true, 'default' => null, 'after' => 'login_attempt'])
              ->update();
    }

}