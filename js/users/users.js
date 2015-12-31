define(['services', 'user_editor/user_editor'], function() {
	return angular.module('UsersModule', ['ServicesModule', 'UserEditorModule'])
		.directive('users', function($rootScope, rpc) {
			return {
			  scope: {
			    classId: '=',
			  },
			  link: function($scope) {
			    $scope.$watch('classId', function(classId) {
			      rpc.get_users(null, classId).then(function(response) {
			        $scope.users = response.data;
	            $scope.editingUser = null;
			      });
			    });
		      $scope.showInfo = function(user) {
		        $scope.editingUser = user;
		      };
			  },
				templateUrl : 'js/users/users.html'
			};
		});
});
