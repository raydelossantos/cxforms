<?php

use Phinx\Migration\AbstractMigration;

class AddColumnMaximunDisplayCharactersOnFormFieldTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_fields';

        $table = $this->table($tbl);
        $table
              ->addColumn('maximum_display_characters', 'integer', ['null' => true, 'default' => 0, 'after' => 'show_this_field_on_default_table_view'])
              ->update();
    }
}
