<?php

use Phinx\Migration\AbstractMigration;

class ChangeLookupScopeIdColumnFormFieldsTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_fields';

        $table = $this->table($tbl);

        $table->changeColumn('lookup_scope_id', 'json')
              ->update();
    }

}
