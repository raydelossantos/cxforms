<?php

use $useClassName;

class $className extends $baseClassName {
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change() {
        // create the table
        $table = $this->table('user_logins');
        $table->addColumn('user_id', 'integer')
              ->addColumn('created', 'datetime')
              ->create();
    }

    /**
     * Migrate Up.
     */
    public function up() {
        // inserting only one row
        $singleRow = [
            'id'    => 1,
            'name'  => 'In Progress'
        ];

        $table = $this->table('status');
        $table->insert($singleRow);
        $table->saveData();

        // inserting multiple rows
        $rows = [
            [
              'id'    => 2,
              'name'  => 'Stopped'
            ],
            [
              'id'    => 3,
              'name'  => 'Queued'
            ]
        ];

        // this is a handy shortcut
        $this->insert('status', $rows);
    }

    /**
     * Migrate Down.
     */
    public function down() {
        $this->execute('DELETE FROM status');
    }
}
