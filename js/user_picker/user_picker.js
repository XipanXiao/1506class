define(['services'], function() {
	return angular.module('UserPickerModule', ['ServicesModule'])
		.directive('userPicker', function(rpc) {
			return {
//			  scope: {
//          user: '='
//        },
			  link: function($scope, $attrs) {
		      $scope.showPicker = false;
		      $scope.userName = $attrs.userName;
		      console.log($attrs.classId);

		      $scope.edit = function() {
		        if ($scope.classMates) {
		          $scope.showPicker = true;
		        } else {
		          rpc.get_users(null, $attrs.classId).then(function(response) {
		            console.log(response.data);
		            $scope.classMates = response.data;//{};
//		            for (var key in response.data) {
//		              var user = response.data[key];
//		              $scope.classMates[user.id] = user.name;
//		            }
		            
		            $scope.showPicker = true;
		          });
		        }
		      };
		      
		      $scope.selected = function() {
		        console.log($scope.userName);
		      };
		    },
				templateUrl : 'js/user_picker/user_picker.html'
			};
		});
});
