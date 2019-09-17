<?php

use Phinx\Migration\AbstractMigration;

class ChangeReportsUrlColumnFromFormsTable extends AbstractMigration {
    
    public function change() {
        $tbl = 'forms';

        $table = $this->table($tbl);
        $table->removeIndex(['reports_url']);

        $table->changeColumn('reports_url', 'string', ['limit' => 255, 'null' => true, 'default' => null])
              ->update();
    }

}
