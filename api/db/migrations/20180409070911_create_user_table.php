<?php

use Phinx\Migration\AbstractMigration;

class CreateUserTable extends AbstractMigration {
    private $tbl = 'users';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('username', 'string')
                  ->addColumn('is_admin', 'boolean', ['default' => false, 'comment' => '0 - ordinary user (e.g. Client/Team Members) | 1 - admin (lookup on admin_privileges table)'])
                  ->addColumn('login_attempt', 'integer', ['default' => 0])
                  ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
                  ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
                  ->addIndex('username', ['unique' => TRUE])
                  ->addIndex('id', ['unique' => TRUE])
                  ->create();
        }
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
