<?php

use \models\SceneModel;
use \models\ShowModel;

class MongoTestEnvironment
{
	
	/**
	 * @var MongoDB
	 */
	private $_db;
	
	public function __construct()
	{
		$this->_db = \models\mapper\MongoStore::connect(SL_DATABASE);
	}

	/**
	 * Removes all the collections from the mongo database.
	 * Hopefully this is only ever called on the scriptureforge_test database.
	 */
	public function clean()
	{
		foreach ($this->_db->listCollections() as $collection)
		{
			$collection->drop();
		}
	}

	/**
	 * Querys the given $collection and returns a MongoCursor.
	 * @param string $collection
	 * @param array $query
	 * @param array $fields
	 * @return MongoCursor
	 */
	public function find($collection, $query, $fields = array()) {
		$collection = $this->_db->$collection;
		return $collection->find($query, $fields);
	}
	
	/**
	 * Writes a user to the users collection.
	 * @param string $username
	 * @param string $name
	 * @param string $email
	 * @return string id
	 */
	public function createShow($name) {
		$showModel = new models\ShowModel();
		$showModel->name = $name;
		return $showModel->write();
	}
	
	public function createScene($showId, $sceneName) {
		$sceneModel = new models\SceneModel();
		$sceneModel->name = $sceneName;
		return ShowModel::writeScene($showId, $sceneModel);
	}
	
	public function inhibitErrorDisplay() {
		$this->_display = ini_get('display_errors');
		ini_set('display_errors', false);
	}
	
	public function restoreErrorDisplay() {
		ini_set('display_errors', $this->_display);
	}
		
}