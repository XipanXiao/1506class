define(['editable_label/editable_label', 'services', 'utils'], function() {
	return angular.module('CourseEditorModule', ['EditableLabelModule',
      'ServicesModule', 'UtilsModule'])
		.directive('courseEditor',
				function(rpc, utils) {
					return {
					  link: function($scope) {
                rpc.get_course_groups().then(function(response) {
                  $scope.course_groups = response.data;
                });

              $scope.updateGroup = function(group) {
                console.log(group);
                var data = {
                  id: group.id,
                  name: group.name
                };

                rpc.update_course_group(data);
              };
              
              $scope.updateCourse = function(course) {
                rpc.update_course(course);
              };
              
              $scope.append = function(group, index) {
                group.courses.splice(index + 1, 0, {
                  name: '点击输入课程内容'
                });
              };
					  },
						templateUrl : 'js/course_editor/course_editor.html'
					};
				});
});
