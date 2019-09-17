<?php

use Phinx\Migration\AbstractMigration;

class ChangeFormUserTable extends AbstractMigration {

    public function change() {
        $tbl = 'form_user';

        $table = $this->table($tbl);
        $table
              ->removeColumn('allow_print')
              ->removeColumn('allow_view')
              ->removeColumn('allow_edit')
              ->removeColumn('allow_delete')
              ->removeColumn('allow_export')

              ->addColumn('client_id', 'integer', ['default' => false, 'after' => 'form_id'])
              ->addColumn('lob_id', 'integer', ['after' => 'client_id'])

              ->addColumn('view_own', 'boolean', ['default' => false, 'after' => 'lob_id'])
              ->addColumn('edit_own', 'boolean', ['default' => false, 'after' => 'view_own'])
              ->addColumn('view_all', 'boolean', ['default' => false, 'after' => 'edit_own'])
              ->addColumn('edit_all', 'boolean', ['default' => false, 'after' => 'view_all'])
              ->addColumn('export_data', 'boolean', ['default' => false, 'after' => 'edit_all'])
              ->addColumn('access_control', 'boolean', ['default' => false, 'after' => 'export_data'])
              ->addColumn('configure_list', 'boolean', ['default' => false, 'after' => 'access_control'])
              ->update();
    }

}
