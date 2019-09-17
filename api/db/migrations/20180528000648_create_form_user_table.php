<?php

use Phinx\Migration\AbstractMigration;

class CreateFormUserTable extends AbstractMigration {
    private $tbl = 'form_user';

    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('user_id', 'integer')
              ->addColumn('form_id', 'integer')
              ->addColumn('allow_view', 'boolean')
              ->addColumn('allow_edit', 'boolean')
              ->addColumn('allow_delete', 'boolean')
              ->addColumn('allow_print', 'boolean')
              ->addColumn('allow_export', 'boolean')
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->create();

              // VALIDATIONS for same short_name withing the same form should be implemented on coding
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
