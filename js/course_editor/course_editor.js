define(['editable_label/editable_label', 'services', 'utils'], function() {
	return angular.module('CourseEditorModule', ['EditableLabelModule',
      'ServicesModule', 'UtilsModule'])
		.directive('courseEditor',
				function(rpc, utils) {
					return {
					  scope: {
					    groupId: '='
					  },
					  link: function($scope) {
                rpc.get_course_groups().then(function(response) {
                  $scope.course_groups = response.data;
                  $scope.groupIds = utils.keys($scope.course_groups);
                  $scope.group = utils.firstElement($scope.course_groups, 'id',
                      $scope.groupId);
                  
                  if ($scope.group) $scope.select($scope.group.id);
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
              
              $scope.expand = function() {
                $scope.expanded = true;
                document.querySelector('#course-editor-dlg').open();
              };
              
              $scope.collapse = function() {
                $scope.expanded = false;
              };
              
              $scope.confirm = function() {
                $scope.collapse();
              };
              
              $scope.select = function(id) {
                if ($scope.group.id != id) {
                  $scope.group = utils.firstElement($scope.course_groups, 'id',
                      id);
                }

                $scope.groupId = id;
                rpc.get_courses(id).then(function(response) {
                  $scope.group.courses = response.data;
                });
              };
					  },
						templateUrl : 'js/course_editor/course_editor.html'
					};
				});
});
