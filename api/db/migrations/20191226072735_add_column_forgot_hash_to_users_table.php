<?php

use Phinx\Migration\AbstractMigration;

class AddColumnForgotHashToUsersTable extends AbstractMigration {

    public function change() {
        $tbl = 'users';

        $table = $this->table($tbl);
        $table
            ->addColumn('forgot_hash', 'string', ['null' => true, 'default' => null, 'after' => 'reset_hash'])
            ->update();
    }

}
