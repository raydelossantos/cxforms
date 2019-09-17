<?php

use Phinx\Migration\AbstractMigration;

class CreateUserLogTable extends AbstractMigration {
    private $tbl = 'user_logs';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('user_id', 'integer')
                  ->addColumn('activity', 'string')
                  ->addColumn('ip_address', 'string')
                  ->addColumn('user_agent', 'string')
                  ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
                  ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
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
