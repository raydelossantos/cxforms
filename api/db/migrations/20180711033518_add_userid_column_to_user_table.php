<?php

use Phinx\Migration\AbstractMigration;

class AddUseridColumnToUserTable extends AbstractMigration {
    public function change() {
        // update the table
        $tbl = "user_info";

        $table = $this->table($tbl);
        $table->addColumn('user_id', 'integer', ['after' => 'username', 'default' => 0, 'null' => false])
              ->save();
    }

}
