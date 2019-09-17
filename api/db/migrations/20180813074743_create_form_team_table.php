<?php

use Phinx\Migration\AbstractMigration;

class CreateFormTeamTable extends AbstractMigration {
    private $tbl = 'form_team';

    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('team_id', 'integer')
              ->addColumn('form_id', 'integer')
              ->addColumn('client_id', 'integer', ['default' => false, 'after' => 'form_id'])
              ->addColumn('lob_id', 'integer', ['default' => false, 'after' => 'client_id'])
              ->addColumn('view_own', 'boolean', ['default' => false, 'after' => 'lob_id'])
              ->addColumn('edit_own', 'boolean', ['default' => false, 'after' => 'view_own'])
              ->addColumn('view_all', 'boolean', ['default' => false, 'after' => 'edit_own'])
              ->addColumn('edit_all', 'boolean', ['default' => false, 'after' => 'view_all'])
              ->addColumn('export_data', 'boolean', ['default' => false, 'after' => 'edit_all'])
              ->addColumn('access_control', 'boolean', ['default' => false, 'after' => 'export_data'])
              ->addColumn('configure_list', 'boolean', ['default' => false, 'after' => 'access_control'])
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->create();
    }

    /**
     * Migrate Down.
     */
    public function down() {
        if ($this->hasTable($this->tbl)) {
            $this->dropTable($this->tbl);
        }    
    }
}
