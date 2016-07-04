define('schedule_group_editor/schedule_group_editor',
    ['course_groups/course_groups', 'editable_label/editable_label',
    'services', 'utils'], function() {

  return angular.module('ScheduleGroupEditorModule',
      ['CourseGroupsModule', 'EditableLabelModule', 'ServicesModule',
       'UtilsModule']).directive('scheduleGroupEditor',
        function(rpc, utils) {
          return {
            scope: {
              group: '=',
              onCancel: '&',
              onSave: '&'
            },
            link: function(scope) {
              scope.saveGroup = function(group) {
                rpc.update_schedule_group(group).then(function(response) {
                  if (parseInt(response.data.updated)) {
                    group.editing = false;
                    scope.onSave();
                  }
                });
              };

              /// Returns true if name1 and name2 has the same name prefix.
              ///
              /// e.g. 入行论广解23 and 入行论广解24
              scope.isSameName = function(name1, name2) {
                return name1[0] == name2[0] && name1[1] == name2[1];
              };
              scope.getCourseIds = function(group) {
                return rpc.get_courses(group).then(function(courses) {
                  return utils.keys(courses);
                });
              };
              scope.merge_courses = function(course_ids1, course_ids2) {
                var group = scope.group;
                var appending = scope.isSameName(
                    group.courses[course_ids1[0]].name,
                    group.courses[course_ids2[0]].name);
                if (appending) {
                  return course_ids1.concat(course_ids2);
                } else {
                  var alternate = [];
                  for (var index = 0;index < course_ids1.length; index++) {
                    alternate.push(course_ids1[index]);
                    alternate.push(course_ids2[index]);
                  }
                  return alternate;
                }
              };
              scope.courseGroupChanged = function(courses, second) {
                var group = scope.group;
                var course_ids1, course_ids2, course_ids;
                group.courses = utils.mix_in(group.courses || {}, courses);

                if (second) {
                  course_ids2 = utils.keys(courses);
                } else {
                  course_ids1 = utils.keys(courses);
                }
                var hasSecondCourse = second || parseInt(group.course_group2);
                if (!hasSecondCourse) {
                  return scope.arrange_schedules(course_ids1);
                }
                var groupToLoad = second ?
                    group.course_group : group.course_group2;
                scope.getCourseIds(groupToLoad).then(function(courseIds) {
                  if (!course_ids1) {
                    course_ids1 = courseIds;
                  } else {
                    course_ids2 = courseIds;
                  }

                  if (course_ids2.length != course_ids1.length) {
                    alert('Secondary course should have same lessons as the' +
                        ' primary one.');
                    return;
                  }

                  courseIds = scope.merge_courses(course_ids1, course_ids2);
                  scope.arrange_schedules(courseIds, true);
                });
              };

              scope.arrange_schedules = function(course_ids, hasSecondCourse) {
                var week = 0;
                var courseIndex = 0;
                var schedule_id = 0;
                var group = scope.group;
                var weeks = Math.max(course_ids.length, 25);
                
                if (group.schedules && utils.keys(group.schedules).length) {
                  // Modifying existing schedules.
                  for (var id in group.schedules) {
                    week++;
                    var schedule = group.schedules[id];
                    if (!parseInt(schedule.course_id)) continue;
                    schedule.course_id = course_ids[courseIndex++];
                    if (hasSecondCourse) {
                      schedule.course_id2 = course_ids[courseIndex++];
                    }
                  }
                  schedule_id = utils.maxKey(group.schedules) + 1;
                } else {
                  group.schedules = {};
                }

                // Appending new schedules.
                for (; week < weeks; week++) {
                  var courseId = 0;
                  var holiday = utils.isHolidayWeek(group.start_time, week);
                  if (holiday) {
                    // Don't append a holiday at the end.
                    if (week == weeks - 1) break;
                  } else {
                    courseId = course_ids[courseIndex++];
                    if (!courseId) break;
                  }

                  var schedule = {
                    id: 0,
                    course_id: courseId, 
                    group_id: group.id
                  };
                  if (hasSecondCourse) {
                    schedule.course_id2 = course_ids[courseIndex++];
                  }
                  group.schedules[schedule_id] = schedule;
                  schedule_id++;
                }
                
                setTimeout(function() {
                  scope.$apply();
                }, 0);

                return utils.truePromise();
              };
              scope.limitedGroupChange = function(courses) {
                scope.group.limited_courses = courses;
              };
              scope.terms = (function() {
                var terms = [];
                for (var index = 1;index <= utils.totalTerms; index++)
                  terms.push(index);
                return terms;
              })();
            },
            templateUrl : 'js/schedule_group_editor/schedule_group_editor.html'
          };
        });
});
