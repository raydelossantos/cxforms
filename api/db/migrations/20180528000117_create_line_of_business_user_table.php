<?php

use Phinx\Migration\AbstractMigration;

class CreateLineOfBusinessUserTable extends AbstractMigration {
    private $tbl = 'lob_user';

    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('user_id', 'integer')
              ->addColumn('lob_id', 'integer')
              ->addColumn('client_id', 'integer', ['default' => 0, 'comment' => 'Client ID this LOB belongs to.'])                  // users assigned to these
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])                  // users assigned to these
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
