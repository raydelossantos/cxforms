<?php

use Phinx\Migration\AbstractMigration;

class CreateFormFieldsTable extends AbstractMigration {
    private $tbl = 'form_fields';

    public function up() {

        if ($this->hasTable($this->tbl)) {
            return;
        }

        // create the table
        $table = $this->table($this->tbl);
        $table->addColumn('form_id', 'integer')
              ->addColumn('label', 'string')
              ->addColumn('description', 'string')
              ->addColumn('form_field_name', 'string')
              ->addColumn('short_id', 'string')
              ->addColumn('field_type', 'string')
              ->addColumn('size', 'string')
              ->addColumn('validation_mask', 'string')
              ->addColumn('dropdown_name', 'string')
              ->addColumn('selection_options', 'text')
              ->addColumn('lookup_scope_id', 'integer', ['default' => 0, 'comment' => '0 - everybody | not zero filter to team id'])
              ->addColumn('lookup_list_id', 'integer')
              ->addColumn('lookup_dependencies', 'string')
              ->addColumn('lookup_source_field', 'string')
              ->addColumn('timer_duration', 'integer', ['null' => true, 'default' => NULL])
              ->addColumn('timer_reset_action', 'string', ['null' => true, 'default' => NULL])
              ->addColumn('tag_button_text', 'string')
              ->addColumn('required', 'boolean', ['default' => false])
              ->addColumn('readonly', 'boolean', ['default' => false])
              ->addColumn('visibility', 'string', ['null' => true, 'default' => NULL])
              ->addColumn('role_restrictions_id', 'integer')
              ->addColumn('group_name', 'string')
              ->addColumn('first_day_active', 'date', ['null' => true, 'default' => NULL])
              ->addColumn('last_day_active', 'date', ['null' => true, 'default' => NULL])
              ->addColumn('show_this_field_on_default_table_view', 'boolean')
              ->addColumn('url_timer_reset', 'string')
              ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
              ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->addColumn('deleted_at', 'timestamp', ['null' => true, 'default' => NULL])
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
