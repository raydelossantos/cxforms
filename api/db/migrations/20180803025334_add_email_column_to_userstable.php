<?php

use Phinx\Migration\AbstractMigration;

class AddEmailColumnToUserstable extends AbstractMigration {

    public function change() {
        $tbl = 'user_info';

        $table = $this->table($tbl);
        $table->addColumn('email', 'string', ['limit' => 255, 'null' => false, 'after' => 'username'])
              ->update();
    }

}
