define(['services'], function() {
	return angular.module('UserPickerModule', ['ServicesModule'])
		.directive('userPicker', function(rpc) {
		  var indexOf = function(map, obj) {
		    for (var key in map) {
		      if (obj == map[key]) return key;
		    }
		    
		    return null;
		  };
		  
			return {
			  scope: {
			    userPicked: '&',
          userId: '=',
          users: '='
        },
			  link: function($scope) {
		      $scope.showPicker = false;
		      $scope.selectedUser = {name: $scope.users[$scope.userId]};

		      $scope.edit = function() {
		        $scope.showPicker = true;
		      };
		      
		      $scope.select = function() {
		        $scope.userId = indexOf($scope.users, $scope.selectedUser.name);
		        if ($scope.userPicked) $scope.userPicked({userId: $scope.userId});
		        $scope.showPicker = false;
		      };
		    },
				templateUrl : 'js/user_picker/user_picker.html'
			};
		});
});
