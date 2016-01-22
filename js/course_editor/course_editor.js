define(['editable_label/editable_label', 'services', 'utils'], function() {
	return angular.module('CourseEditorModule', ['EditableLabelModule',
      'ServicesModule', 'UtilsModule'])
		.directive('courseEditor',
				function(rpc, utils) {
					return {
					  scope: {
					    groupId: '=',
					    onChange: '&'
					  },
					  link: function($scope) {
                rpc.get_course_groups().then(function(response) {
                  $scope.course_groups = response.data;
                  $scope.course_groups[0] = {
                    id: 0,
                    name: '新建',
                    courses: {}
                  };
                  $scope.groupIds = utils.positiveKeys($scope.course_groups);
                  $scope.group = utils.firstElement($scope.course_groups, 'id',
                      $scope.groupId);
                  
                  if ($scope.group) $scope.select($scope.group.id);
                });

              $scope.updateGroup = function(group) {
                var creatingNew = !group.id;
                rpc.update_course_group(group).then(function(response) {
                  group = response.data.group;
                  if (group && group.id && creatingNew) {
                    group.courses = {};
                    $scope.course_groups[group.id] = group;
                    $scope.groupIds = utils.positiveKeys($scope.course_groups);
                    $scope.select(group.id);
                  }
                });
                
                if (creatingNew) {
                  group.name = '新建';
                }
              };
              
              $scope.removeGroup = function(group) {
                if (group.courses && 
                    utils.any(group.courses, function(course) {
                      return course.id;
                    })) {
                  alert('请先删除所有课程，再删除课程组。');
                  return;
                }

                rpc.remove_course_group(group.id).then(function(response) {
                  if (parseInt(response.data.deleted) == 1) {
                    delete $scope.course_groups[group.id];
                    $scope.groupIds = utils.positiveKeys($scope.course_groups);
                    $scope.select(0);
                  }
                });
              };
              
              $scope.updateCourse = function(course) {
                rpc.update_course(course).then(function(response) {
                  var updated = response.data;
                  if (updated.id && !course.id) {
                    course.id = updated.id;
                  }
                });
              };
              
              $scope.appendCourse = function(group) {
                var id = utils.maxKey(group.courses) + 1;
                var length = utils.keys(group.courses).length;
                group.courses[id] = {
                  id: 0,
                  group_id: group.id,
                  name: '{0}第{1}节'.format(group.name, length + 1)
                };
              };
              
              $scope.expand = function() {
                $scope.expanded = true;
                document.querySelector('#course-editor-dlg').open();
              };
              
              $scope.select = function(id) {
                if ($scope.group.id != id) {
                  $scope.group = utils.firstElement($scope.course_groups, 'id',
                      id);
                }

                $scope.groupId = id;
                if (!id) return;

                rpc.get_courses(id).then(function(courses) {
                  $scope.group.courses = courses;
                  if ($scope.onChange) {
                    setTimeout(function() {
                      $scope.$apply();
                      $scope.onChange();
                    }, 0);
                  }
                });
              };
              
              $scope.hasNewCourses = function() {
                return $scope.group && $scope.group.courses &&
                    utils.any($scope.group.courses, function(course) {
                      return !course.id;
                    });
              };
              
              $scope.saveNewCourses = function() {
                for (var id in $scope.group.courses) {
                  var course = $scope.group.courses[id];
                  if (course.id) continue;
                  
                  $scope.updateCourse(course);
                }
              };
              
              $scope.removeCourse = function(course) {
                rpc.remove_course(course.id).then(function(response) {
                  if (!response.data.deleted) return;
                  delete $scope.group.courses[course.id];
                });
              };
					  },
						templateUrl : 'js/course_editor/course_editor.html'
					};
				});
});
