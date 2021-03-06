'use strict';

/* Controllers */
var module = angular.module(
	'sl.show',
	[ 'sl.services', 'palaso.ui.listview', 'ui.bootstrap' ]
);
module.controller('ShowCtrl', ['$scope', 'sceneService', 'breadcrumbService', '$routeParams', '$timeout', 
                               function($scope, sceneService, breadcrumbService, $routeParams, $timeout) {
	
	$scope.debug = {};
	$timeout(function() {
		$scope.debug.setTab = true;  
	}, 0);

	$scope.settings = {};
	$scope.show = {};
	$scope.show.id = $routeParams.showId;

	breadcrumbService.set('top',
			[
			 {href: '#/shows', label: 'All Shows'},
			 {href: '#/show/' + $scope.show.id, label: ''},
			]
	);
	var updateBreadcrumbs = function() {
		breadcrumbService.updateCrumb('top', 1, { label: $scope.show.name });
	};
	
	var updateResources= function(resources) {
		$scope.videoResources = [];
		$scope.imageResources = [];
		$scope.flashResources = [];
		for (var i = 0, c = resources.length; i < c; i++) {
			switch (resources[i].type) {
			case 1:
				$scope.videoResources.push(resources[i]);
				break;
			case 2:
				$scope.imageResources.push(resources[i]);
				break;
			case 3:
				$scope.flashResources.push(resources[i]);
				break;
			}
		}
	};

	// Read
	$scope.queryShow = function() {
		sceneService.readShow($scope.show.id, function(result) {
			if (result.ok) {
				console.log('resourceList');
				sceneService.resourcesList(function(result2) {
					if (result2.ok) {
						console.log('resourceList ok');
						updateResources(result2.data.resources);
					}
					$scope.show = result.data.show;
					$scope.settings = result.data.settings;
					updateBreadcrumbs();
				});
			}
		});
	};
	$scope.queryShow();
	
}]);
module.controller('ShowScenesCtrl', ['$scope', 'sceneService', '$routeParams', function($scope, sceneService, $routeParams) {
	// Selection
	$scope.selected = [];
	$scope.updateSelection = function(event, item) {
		var selectedIndex = $scope.selected.indexOf(item);
		var checkbox = event.target;
		if (checkbox.checked && selectedIndex == -1) {
			$scope.selected.push(item);
		} else if (!checkbox.checked && selectedIndex != -1) {
			$scope.selected.splice(selectedIndex, 1);
		}
	};
	$scope.isSelected = function(item) {
		return item != null && $scope.selected.indexOf(item) >= 0;
	};
	
	// Remove
	$scope.removeScenes = function() {
		console.log("removeScenes");
		var sceneIds = [];
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			sceneIds.push($scope.selected[i]);
		}
		if (l == 0) {
			// TODO ERROR
			return;
		}
		sceneService.remove($scope.show.id, sceneIds, function(result) {
			if (result.ok) {
				$scope.queryShow();
			}
		});
	};
	
	// Add Scene
	$scope.addScene = function() {
		var model = {};
		model.id = '';
		model.name = this.sceneName;
		console.log("addScene ", model);
		sceneService.update($scope.show.id, model, function(result) {
			if (result.ok) {
				$scope.queryShow();
			}
		});
	};
	
	// Scene Index
	$scope.$watch("show", function(newValue, oldValue) {
//		console.log("watch show", newValue);
		if ($scope.show.scenesIndex == undefined) {
			return;
		}
		var index = [];
		for (var i = 0, l = $scope.show.scenesIndex.length; i < l; i++) {
			var id = $scope.show.scenesIndex[i];
			var model = {
				'id': id, 
				'name': $scope.show.scenes[id].name,
				'snapUrl': $scope.show.scenes[id].snapUrl
			};
			index.push(model);
		}
		$scope.scenesIndex = index;
	});
	$scope.$watch("scenesIndex", function(newValue, oldValue) {
		console.log('watch scenesIndex', newValue);
		if ($scope.show.scenesIndex == undefined) {
			return;
		}
		var index = [];
		for (var i = 0, l = $scope.scenesIndex.length; i < l; i++) {
			index.push($scope.scenesIndex[i].id);
		}
		console.log('index udpate');
		sceneService.updateScenesIndex($scope.show.id, index, function(result) {
			if (result.ok) {
				// TODO notify CP 2013-07
				console.log('index udpate ok');
			}
		});
		
	}, true);
	
	/*
	$scope.imageSource = function(avatarRef) {
		return avatarRef ? '/images/avatar/' + avatarRef : '/images/avatar/anonymous02.png';
	};
	*/

}]);
module.controller('ShowActionsCtrl', ['$scope', 'showService', '$routeParams', function($scope, showService, $routeParams) {
	//$scope.isActive = true;
	//$scope.currentAction = {"name": "Action 2"};
	
	$scope.bugText = 'Bug Text';

	$scope.saveShow = function() {
		console.log("saveShow() ", $scope.show);
		// TODO This probably be better with an updateActions in the show api CP 2013-07
		showService.update($scope.show, function(result) {
			if (result.ok) {
				// TODO Notify CP 2013-07
			}
		});
	};
	
	//---------------------------------------------------------------
	// ACTIONS
	//---------------------------------------------------------------
	$scope.currentAction = undefined;

	// Watch action list
	$scope.$watch('show.actions', function(newValue, oldValue) {
		console.log('actions watch ', newValue);
		if (!newValue) {
			return;
		}
		for (var key in newValue) {
			$scope.currentAction = newValue[key];
			break;
		}
	});
	
	// Watch action select
	$scope.$watch('currentAction', function(newValue, oldValue) {
		console.log('currentAction', newValue);
		$scope.bugText = newValue;
	});
	
	$scope.addAction = function() {
		console.log("addAction()");
		var model = {};
		model.id = '';
		model.name = $scope.newActionName;
		showService.updateAction($scope.show.id, model, function(result) {
			if (result.ok) {
				model.id = result.data;
				$scope.show.actions[model.id] = model;
				$scope.currentAction = model;
			}
		});
	};
	
	$scope.removeAction = function() {
		console.log("removeAction()");
		showService.removeAction($scope.show.id, $scope.currentAction.id, function(result) {
			if (result.ok) {
				delete $scope.show.actions[$scope.currentAction.id];
			}
		});
	};
	
	// Preview Action
	$scope.actionInClick = function() {
		console.log("action in");
		showService.previewAction($scope.currentAction, 'in', function($result) {
			console.log("action in ok");
		});
	};
	
	$scope.actionOutClick = function() {
		console.log("action out");
		showService.previewAction($scope.currentAction, 'out', function($result) {
			console.log("action out ok");
		});
	};
	
	//---------------------------------------------------------------
	// Commands
	//---------------------------------------------------------------
	$scope.currentCommand = undefined;
	
	$scope.allCommands = 
		[
		 {'cat': 'Input',  'type': 'Camera'},
		 {'cat': 'Input',  'type': 'Flash Template'},
		 {'cat': 'Input',  'type': 'Image'},
		 {'cat': 'Input',  'type': 'Stream'},
		 {'cat': 'Input',  'type': 'Video'},
		 {'cat': 'Mixer',  'type': 'Geometry'},
		 {'cat': 'Mixer',  'type': 'Grid'},
		 {'cat': 'Mixer',  'type': 'Opacity'},
		 {'cat': 'Mixer',  'type': 'Chroma'},
		 {'cat': 'Mixer',  'type': 'Route'},
		 {'cat': 'Output', 'type': 'File'}
		];
	$scope.newCommandType = $scope.allCommands[0];
	$scope.chromaColors = ['Green', 'Blue'];

	$scope.addCommand = function() {
		console.log('addCommand()');
		var model = {};
		model.name = 'New Command';
		model.type = $scope.newCommandType.type;
		if ($scope.currentAction.commands == undefined) {
			$scope.currentAction.commands = [];
		}
		$scope.currentAction.commands.push(model);
		$scope.currentCommand = model;
		$scope.selectCommand($scope.currentCommand);
	};
	
	$scope.removeCommand = function(index) {
		console.log('removeCommand() ', index);
		$scope.currentAction.commands.splice(index, 1);
	};
	
	$scope.selectCommand = function(command) {
		console.log('selectCommand() ', command);
		$scope.currentCommand = command;
		if (command.type == 'Flash Template') {
			if (command.dataSet == undefined) {
				command.dataSet = [];
			}
			if (command.dataSet.length == 0) {
				$scope.addFlashData();
			}
		}
	};
	
	// Flash Template Command
	$scope.addFlashData = function() {
		var model = {};
		model.name = '';
		model.fieldId = 'f0';
		model.value = '';
		model.useDefaultOnly = false;
		
		if ($scope.currentCommand.dataSet == undefined) {
			$scope.currentCommand.dataSet = [];
		}
		
		$scope.currentCommand.dataSet.push(model);
	};
	
	$scope.removeFlashData = function(index) {
		$scope.currentCommand.dataSet.splice(index, 1);
		if ($scope.currentCommand.dataSet.length == 0) {
			$scope.addFlashData();
		}
	};
	
	/*
	$scope.imageSource = function(avatarRef) {
		return avatarRef ? '/images/avatar/' + avatarRef : '/images/avatar/anonymous02.png';
	};
	*/

}]);
