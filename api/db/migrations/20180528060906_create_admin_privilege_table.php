<?php

use Phinx\Migration\AbstractMigration;

class CreateAdminPrivilegeTable extends AbstractMigration {
    private $tbl = 'admin_privileges';
    /**
     * Migrate Up.
     */
    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('username', 'string')
              ->addColumn('display_name', 'string', ['null' => false, 'comment' => 'Displays to client screen. (e.g. Admin, Manager, Staff)'])
              ->addColumn('manage_admins', 'boolean', ['default' => false, 'comment' => '0 - no access | 1 - view only | 2 - edit access'])
              ->addColumn('manage_clients', 'boolean', ['default' => false, 'comment' => '0 - no access | 1 - view only | 2 - edit access'])
              ->addColumn('manage_teams', 'boolean', ['default' => false, 'comment' => '0 - no access | 1 - view only | 2 - edit access'])
              ->addColumn('manage_users', 'boolean', ['default' => false, 'comment' => '0 - no access | 1 - view only | 2 - edit access'])
              ->addColumn('manage_lob', 'boolean', ['default' => false, 'comment' => '0 - no access | 1 - view only | 2 - edit access'])
              ->addColumn('manage_forms', 'boolean', ['default' => false, 'comment' => '0 - no access | 1 - view only | 2 - edit access'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->addIndex('username', ['unique' => TRUE])
              ->addIndex('id', ['unique' => TRUE])
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
