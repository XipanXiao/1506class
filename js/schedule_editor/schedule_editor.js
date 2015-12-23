define(['services', 'user_picker/user_picker'], function() {
	return angular.module('ScheduleEditorModule',
	    ['ServicesModule', 'UserPickerModule'])
		.controller('ScheduleEditorController', function($scope, rpc) {
			$scope.$on('class-selected', function(event, classInfo) {
			  $scope.classId = classInfo.id;
	      rpc.get_schedules(false, classInfo.id).then(function(response) {
	        $scope.schedule_groups = response.data;
	      });
      });
			
			$scope.updateReview = function(schedule) {
        var review_id;
			  for (var id in $scope.classMates) {
			    if ($scope.classMates[id] == schedule.review) {
			      review_id = id;
			      break;
			    }
			  }

			  console.log(review_id);
			  schedule.showReviewEditor = false;
			};
		})
		.directive('scheduleEditor',
				function() {
					return {
						templateUrl : 'js/schedule_editor/schedule_editor.html'
					};
				});
});
