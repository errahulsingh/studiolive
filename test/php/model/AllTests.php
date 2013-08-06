<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SIMPLE_TEST_PATH . 'autorun.php');

class AllModelTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TEST_PATH . 'model/ShowModel_Test.php');
 		$this->addFile(TEST_PATH . 'model/SceneModel_Test.php');
 		$this->addFile(TEST_PATH . 'model/ActionModel_Test.php');
 		$this->addFile(TEST_PATH . 'model/ShowSceneIndexModel_Test.php');
    }

}

?>