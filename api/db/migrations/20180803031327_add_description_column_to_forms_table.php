<?php

use Phinx\Migration\AbstractMigration;

class AddDescriptionColumnToFormsTable extends AbstractMigration {

    public function change() {
        $tbl = 'forms';

        $table = $this->table($tbl);
        $table->addColumn('description', 'text', ['after' => 'form_name'])
              ->update();
    }

}
