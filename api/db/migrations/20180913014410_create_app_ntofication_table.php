<?php

use Phinx\Migration\AbstractMigration;

class CreateAppNtoficationTable extends AbstractMigration {
    private $tbl = 'app_notifications';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('user_id', 'integer')
                  ->addColumn('type', 'string')
                  ->addColumn('icon', 'string')
                  ->addColumn('link', 'string')
                  ->addColumn('hash', 'string', ['null' => true, 'default' => null])
                  ->addColumn('label', 'string')
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
