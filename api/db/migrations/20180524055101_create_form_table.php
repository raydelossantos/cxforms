<?php

use Phinx\Migration\AbstractMigration;

class CreateFormTable extends AbstractMigration {
    private $tbl = 'forms';
    /**
     * Migrate Up.
     */
    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('form_name', 'string')
              ->addColumn('lob_id', 'integer')
              ->addColumn('short_name', 'string')
              ->addColumn('table_name', 'string')
              ->addColumn('reports_url', 'string', ['limit' => 255])
              ->addColumn('record_closed_criteria', 'string')
              ->addColumn('stay_after_submit', 'boolean')
              ->addColumn('show_submitters_info', 'boolean')
              ->addColumn('hide_values_in_emails', 'boolean')
              ->addColumn('attachments', 'boolean')
              ->addColumn('max_records_in_list_view', 'integer', ['default' => 20, 'comment' => 'The maximum number of records returned from db.'])
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->addIndex('id', ['unique' => TRUE])
              ->addIndex('reports_url', ['unique' => TRUE])
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
