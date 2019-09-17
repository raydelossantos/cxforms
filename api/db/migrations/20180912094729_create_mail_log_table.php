<?php

use Phinx\Migration\AbstractMigration;

class CreateMailLogTable extends AbstractMigration {
    private $tbl = 'mail_logs';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('user_id', 'integer')
                  ->addColumn('receiver', 'string')
                  ->addColumn('sender', 'string')
                  ->addColumn('subject', 'string')
                  ->addColumn('custom', 'string')
                  ->addColumn('body', 'text')
                  ->addColumn('link', 'string')
                  ->addColumn('hash', 'string')
                  ->addColumn('is_sent', 'boolean', ['default' => false])
                  ->addColumn('is_opened', 'boolean' , ['default' => false])
                  ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
                  ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
                  ->addIndex('hash', ['unique' => TRUE])
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
