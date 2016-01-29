define(['services', 'utils'], function() {
	return angular.module('DepartmentsModule', ['ServicesModule', 'UtilsModule'])
		.directive('departments', function(rpc, utils) {
			return {
			  scope: {
			    departmentId: '=',
			    onUpdate: '&'
			  },
			  link: function(scope) {
			    scope.selected = {
			      id: scope.departmentId
			    };
	        rpc.get_departments().then(function(response) {
	          scope.departments = response.data;
	          scope.depIds = utils.map(utils.keys(scope.departments), parseInt);
	        });
	        scope.update = function() {
	          scope.departmentId = scope.selected.id;
	          if (onUpdate) onUpdate();
	        };
	        scope.$watch('departmentId', function(id) {
	          scope.selected.id = id;
	        });
			  },
				templateUrl : 'js/departments/departments.html'
			};
		});
});
