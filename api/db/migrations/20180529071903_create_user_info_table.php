<?php

use Phinx\Migration\AbstractMigration;

class CreateUserInfoTable extends AbstractMigration {
    private $tbl = 'user_info';
    /**
     * Migrate Up.
     */
    public function up() {
        if (!$this->hasTable($this->tbl)) {
            $table = $this->table($this->tbl);
            $table->addColumn('username', 'string', ['comment' => 'Username may come from CS API or manual input. This is required before logging in. Records here are used against login, means no-existence no login. For manual input, kindly use GOOGLE or FACEBOOK emails for AUTH.'])
                  ->addColumn('user_origin', 'integer', ['default' => 0, 'comment' => '0 - Manual input | 1 - From CS API  // This should be automatic when adding.'])
                  ->addColumn('employee_id', 'string', ['default' => '0', 'comment' => '0 - For non-CS API | N - Employee number'])
                  ->addColumn('first_name', 'string')
                  ->addColumn('last_name', 'string')
                  ->addColumn('middle_name', 'string')
                  ->addColumn('created_by', 'integer', ['default' => 0, 'comment' => 'UserID of creator'])
                  ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
                  ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
                  ->addIndex('username', ['unique' => TRUE])
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
