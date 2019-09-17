<?php

use Phinx\Migration\AbstractMigration;

class CreateAppUsersTable extends AbstractMigration {
    private $tbl = 'app_users';
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
              ->addColumn('password', 'string')
              ->addColumn('status', 'boolean', ['comment' => 'Sets user active or disabled | 0 - disabled | 1 - active'])
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->addIndex('id', ['unique' => TRUE])
              ->addIndex('username', ['unique' => true])
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
