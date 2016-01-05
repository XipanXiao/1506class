define(['services', 'user_editor/user_editor', 'utils'], function() {
	return angular.module('UsersModule', ['ServicesModule',
    'UserEditorModule', 'UtilsModule'])
        .directive('users', function($rootScope, rpc, utils) {
			return {
			  scope: {
			    classId: '=',
			  },
			  link: function($scope) {
			    $scope.$watch('classId', function(classId) {
			      rpc.get_users(null, classId).then(function(response) {
			        $scope.users = response.data;
	            $scope.editingUser = $scope.editingUser &&
	                utils.firstElement($scope.users, 'id', $scope.editingUser.id);
			      });
			    });
		      $scope.showInfo = function(user) {
		        $scope.editingUser = user;
		      };
          $scope.$on('editing-user-changed', function(event, editingUser) {
            $scope.editingUser = editingUser;
          });
			  },
				templateUrl : 'js/users/users.html'
			};
		});
});
