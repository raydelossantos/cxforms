<?php

use Phinx\Migration\AbstractMigration;

class AddColumnPhotoToUserinfoTable extends AbstractMigration {

    public function change() {
        $table = $this->table('user_info');
        $table->addColumn('photo', 'string', ['after' => 'email', 'default' => null])
              ->update();
    }

}
