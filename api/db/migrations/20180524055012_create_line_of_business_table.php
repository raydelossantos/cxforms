<?php

use Phinx\Migration\AbstractMigration;

class CreateLineOfBusinessTable extends AbstractMigration {
    private $tbl = 'lines_of_business';
    /**
     * Migrate Up.
     */
    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('lob_name', 'string')
              ->addColumn('description', 'string')
              ->addColumn('client_id', 'integer')             
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
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
