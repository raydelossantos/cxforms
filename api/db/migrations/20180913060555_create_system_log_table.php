<?php

use Phinx\Migration\AbstractMigration;

class CreateSystemLogTable extends AbstractMigration {
    private $tbl = 'system_logs';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('script_name', 'string')
                  ->addColumn('activity', 'string')
                  ->addColumn('remarks', 'string')
                  ->addColumn('start_time', 'datetime', ['default' => null])
                  ->addColumn('end_time', 'datetime', ['default' => null])
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
