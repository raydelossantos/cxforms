<?php

use Phinx\Migration\AbstractMigration;

class CreateAttachmentTable extends AbstractMigration {
    
    private $tbl = 'attachments';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('filename', 'string')
                  ->addColumn('record_id', 'integer')
                  ->addColumn('table_name', 'string')
                  ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
                  ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
                  ->addIndex('filename', ['unique' => TRUE])
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
