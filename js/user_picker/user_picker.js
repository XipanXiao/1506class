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
			    onChange: '=',
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
		        if ($scope.onChange) $scope.onChange();
		        $scope.showPicker = false;
		      };
		    },
				templateUrl : 'js/user_picker/user_picker.html'
			};
		});
});
