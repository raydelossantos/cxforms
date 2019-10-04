<?php

use Phinx\Migration\AbstractMigration;

class AddPasswordToUserTable extends AbstractMigration {

    public function change() {
        $table = $this->table('users');
        $table->addColumn('password', 'string', ['after' => 'username', 'default' => null])
              ->update();
    }

}
