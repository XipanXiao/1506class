define('schedule_editor/schedule_editor',
    ['course_editor_dialog/course_editor_dialog',
     'editable_label/editable_label',
     'navigate_bar/navigate_bar',
     'permission',
    'schedule_group_editor/schedule_group_editor',
    'task_arrangements/task_arrangements',
    'services',
    'user_picker/user_picker', 
    'utils'], function() {

  return angular.module('ScheduleEditorModule',
      ['CourseEditorDialogModule', 'EditableLabelModule',
       'NavigateBarModule',
       'PaperAutoSuggestInputModule',
       'PermissionModule',
       'ScheduleGroupEditorModule',
       'TaskArrangementsModule',
       'ServicesModule', 'UserPickerModule',
       'UtilsModule']).directive('scheduleEditor', function($timeout, perm, rpc, utils) {
          return {
            scope: {
              classId: '=',
            },
            link: function($scope) {
              $scope.week = 1000*3600*24*7;
              
              $scope.getWeeklyTime = function(group, index) {
                return utils.getWeeklyTime(group.start_time, index);
              };
              
              $scope.toDateTime = function(tm) {
                return tm ? utils.toDateTime(tm).toLocaleString() : '';
              };
              
              $scope.isYearLeader = function() {
                return perm.isYearLeader();
              };
              
              $scope.$watch('classId', function() {
                if (!$scope.classId || !confirmReload()) return;

                $scope.term = 0;
                $scope.loadSchedules();
              });
              
              $scope.saveGroup = function(group) {
                rpc.update_schedule_group(group).then(function(response) {
                  if (parseInt(response.data.updated)) {
                    $scope.loadSchedules(group.term);
                  }
                });
              };

              function initTeacherName(key) {
                return function() {
                  var userId = $scope.classInfo[key];
                  if (!userId) return utils.truePromise();
                  return rpc.getUserLabel(userId).then(function(response) {
                    window.userInputCache[userId] = response.data.label;
                    return $scope.teachers[userId] = response.data.label;
                  });
                }
              }

              function getClassInfo() {
                return rpc.get_classes($scope.classId)
                    .then(function(response) {
                  $scope.teachers = {};
                  return $scope.classInfo = response.data[$scope.classId];
                });
              }

              function confirmReload() {
                var group = utils.first($scope.schedule_groups);
                return !group || !group.dirty ||
                    confirm('当前学修安排尚未保存，您确定要继续吗？');
              }
            
              $scope.loadSchedules = function(term) {
                return utils.requestOneByOne([getClassInfo,
                  initTeacherName('teacher_id'),
                  initTeacherName('teacher2_id')
                ]).then(function() {
                  return rpc.get_schedules($scope.classId,
                      term || $scope.term || 0).then(function(response) {
                    $scope.schedule_groups = response.data.groups;
                    utils.forEach($scope.schedule_groups || [], function(group) {
                      group.dirty = false;
                    });
                    var group = utils.first($scope.schedule_groups);
                    if (group) {
                      $scope.term = group.term;
                      utils.calcMiddleWeek(group);
                    } else {
                      $scope.schedule_groups = {};
                    }
                    
                    $scope.users = {};
                    for (var id in response.data.users) {
                      $scope.users[id] = response.data.users[id].name;
                    }
                    return $scope.schedule_groups;
                  });                
                });
              };
              
              function _addTerm(sameTerm) {
                var term = sameTerm ? 
                    $scope.term : 
                        (utils.isEmpty($scope.schedule_groups) ? 
                            1 : utils.last($scope.schedule_groups).term + 1);
                $scope.schedule_groups[0] = {
                  id: 0,
                  term: term,
                  editing: true,
                  classId: $scope.classId,
                  course_group: 0,
                  name: '第{0}学期'.format(term),
                  start_time: utils.unixTimestamp(utils.getDefaultStartTime())
                };
                $scope.term = term;
              }

              var isSingleClick;
              $scope.addTerm = function(dblclick) {
                if (dblclick) {
                  isSingleClick = false;
                  _addTerm(true);
                } else {
                  isSingleClick = true;
                  $timeout(function() {
                    if (!isSingleClick) return;
                    _addTerm();
                  }, 250);
                }
              };
              
              $scope.update = function(schedule, key, value) {
                schedule[key] = value;
                rpc.update_schedule(schedule);
              };
              $scope.editGroup = function(group) {
                group.editing = true;
              };
              $scope.removeGroup = function(group) {
                if (parseInt(group.end_time)) return;
                var message = 'Are you sure to remove this term {0}?'.
                    format(group.term);
                if (!window.confirm(message)) return;

                rpc.remove_schedule_group(group.id).then(function(response) {
                  if (response.data.deleted) $scope.loadSchedules();
                });
              };
              $scope.vacation = function(schedule) {
                return !parseInt(schedule.course_id) && !parseInt(schedule.course_id2);
              };
              window.dragSchedule = function(event) {
                event.dataTransfer.setData("text", event.target.id);
              };
              window.dropSchedule = function(event) {
                event.preventDefault();
                var idToDrop = event.dataTransfer.getData("text");
                var element = event.target;
                var isAcceptingRow = function(element) {
                  return element.id &&
                    element.className.indexOf('css-table-row') >= 0;
                };
                while (element && !isAcceptingRow(element)) {
                  element = element.parentElement;
                }
                if (!element) return;
                
                $scope.insertSchedule(parseInt(idToDrop), parseInt(element.id));
                $scope.$apply();
              };
              window.allowDrop = function(event) {
                event.preventDefault();
              };
              
              /// Moves a schedule identified by [scheduleId] to the position
              /// after the schedule indentified by [insertAfter].
              $scope.insertSchedule = function(scheduleId, insertAfter) {
                var group = $scope.findGroup(scheduleId);
                // Can only reorder within the same schedule group.
                if (!group || group != $scope.findGroup(insertAfter)) return;
                
                var schedules = group.schedules;
                if (scheduleId == insertAfter ||
                    scheduleId == $scope.nextId(schedules, insertAfter, 1)) {
                  return;
                }

                var schedule = angular.copy(schedules[scheduleId]);
                
                var id;
                if (scheduleId < insertAfter) {
                  for (id = scheduleId; id < insertAfter;) {
                    var nextId = $scope.nextId(schedules, id, 1); 
                    schedules[id] = schedules[nextId];
                    schedules[id].id = id;
                    id = nextId;
                  }
                } else {
                  for (id = scheduleId; id > insertAfter+1;) {
                    var nextId = $scope.nextId(schedules, id, -1); 
                    schedules[id] = schedules[nextId];
                    schedules[id].id = id;
                    id = nextId;
                  }
                } 
                schedule.id = id;
                schedules[id] = schedule;
                $scope.editGroup(group);
              };
              
              $scope.nextId = function(schedules, scheduleId, direction) {
                var scheduleIds = utils.keys(schedules);
                for (var index = 0;index < scheduleIds.length; index++) {
                  if (scheduleIds[index] != scheduleId) continue;
                  return scheduleIds[index + direction];
                }
              };
              
              $scope.copySchedule = function(scheduleTo, scheduleFrom) {
                scheduleTo.course_id = scheduleFrom.course_id;
                scheduleTo.open = scheduleFrom.open;
                scheduleTo.review = scheduleFrom.review;
              };
              
              /// Returns the containing schedule group for a schedule.
              $scope.findGroup = function(scheduleId) {
                for (var id in $scope.schedule_groups) {
                  var group = $scope.schedule_groups[id];
                  
                  for (var sId in group.schedules) {
                    if (sId == scheduleId) return group;
                  }
                }
              };
              
              $scope.hasLimitedCourses = function(group) {
                return utils.keys(group.limited_courses).length > 0;
              };
              $scope.navigate = function(direction) {
                if (!confirmReload()) return;

                var term = $scope.term;
                switch (direction) {
                case 0:
                case 2:
                  term = 0;
                  break;
                case 1:
                case -1:
                  term = $scope.term + direction;
                  break;
                case -2:
                  term = 1;
                  break;
                }
                $scope.loadSchedules(term);
              };
              $scope.getEndTime = function(group) {
                var end_time = utils.getEndTime(group);
                return utils.toDateTime(end_time).toLocaleString();
              };
              $scope.getReportCutTime = function(group) {
                var end_time = utils.getEndTime(group) +
                    utils.extraReportTime;
                return utils.toDateTime(end_time).toLocaleString();
              };
              $scope.notify = function(group, schedule, index) {
                if ($scope.sending) return;

                $scope.sending = true;
                function getUserEmail(user) { return user.email; }
                function getEmail() {
                  if ($scope.classInfo.email) {
                    $scope.email = $scope.classInfo.email;
                    return utils.truePromise();
                  }
                  var id = $scope.classInfo.id;
                  return rpc.get_users(null, id).then(function(response) {
                    return $scope.email = 
                        utils.map(response.data, getUserEmail).join(',');
                  });
                }
                function sendMail() {
                  var courseName = group.courses[schedule.course_id].name;
                  return emailjs.send("bicw_notifcation", "class_notification",
                    {
                      email: $scope.email,
                      teacher: $scope.teacherEmail || '',
                      className: $scope.classInfo.name,
                      course: courseName,
                      sender: $scope.user.email,
                      sender_name: $scope.user.name,
                      yy: $scope.classInfo.class_room,
                      time: $scope.getWeeklyTime(group, index),
                      review: $scope.users[schedule.review] || '',
                      open: $scope.users[schedule.open] || ''
                    }).then(function(response) {
                      $scope.sending = false;
                      return true;
                    }, 
                    function(error) {
                      $scope.sending = false;
                      alert('发送邮件失败(一般因为发的人太多，用完了名额，只好麻烦您自己动手了): ' + error);
                      return false;
                    }
                  );
                }
                function update_notified_timestamp() {
                  schedule.notified = (new Date()).toLocaleString();
                  return rpc.update_schedule(schedule).then(function(response) {
                    return response.data.updated;
                  });
                }
                utils.requestOneByOne([getClassInfo, getEmail,
                    sendMail, update_notified_timestamp]);
              };
              $scope.add = function(group, scheduleId) {
                group.editing = true;
                var key = utils.maxKey(group.schedules) + 1;
                var schedule = group.schedules[key] = {id: key};
                $scope.insertSchedule(key, parseInt(scheduleId));
                schedule.id = null;
                $scope.markDirty(group);
              };
              $scope.remove = function(group, scheduleId) {
                group.editing = true;
                delete group.schedules[scheduleId];
                $scope.markDirty(group);
              };
              $scope.searchCourse = function(query, searchingKey) {
                return rpc.searchCourse(query, searchingKey).then(function(response) {
                  if (parseInt(query)) {
                    var course = response.data[parseInt(query)];
                    return course && course.name;
                  }
                  return utils.map(response.data || [], function(course) {
                    course.label = course.name;
                    return course;
                  });
                });
              };
              $scope.append = function(group) {
                group.schedules = group.schedules || {};
                var key = utils.maxKey(group.schedules);
                var schedule = group.schedules[key + 1] = {};

                var last = group.schedules[key];
                if (!last) return;

                var last1 = parseInt(last.course_id);
                var last2 = parseInt(last.course_id2);
                if (last1 && last2 == last1 + 1) {
                  schedule.course_id = last1 + 2;
                  schedule.course_id2 = last1 + 3;
                } else {
                  last1 && (schedule.course_id = last1 + 1);
                  last2 && (schedule.course_id2 = last2 + 1);
                }
                $scope.markDirty(group);
              };
              $scope.markDirty = function(group) {
                group.dirty = true;
              };
              $scope.limitedCourseChanged = function(group, courses, userInitiated) {
                group.limited_courses = courses;
                if (userInitiated) {
                  $scope.markDirty(group);
                }
              };
              $scope.searchUser = rpc.searchUser;

              window.onbeforeunload = function() {
                var group = utils.first($scope.schedule_groups);
                return group && group.dirty ?
                    '请保存或取消学修安排的修改' : null;
              };

              $scope.canWrite = function() {
                return $scope.classInfo &&
                    (perm.canWrite($scope.classInfo) ||
                        perm.isMasterTeacherOf($scope.classInfo));
              };

              $scope.copy = function(term) {
                var group = utils.first($scope.schedule_groups);
                if (group && group.id &&
                      !confirm('这会覆盖本学期原有的学修安排，您确定要继续？')) {
                  return;
                }
                utils.showChooseClassTermDialog($scope.classId, term).then(function(selection) {
                  rpc.copy_schedule_group(selection.classId, selection.term,
                        $scope.classId, term).then(function(response) {
                    if (parseInt(response.data.updated)) {
                      $scope.loadSchedules();
                    }
                  });
                });
              };
            },
            templateUrl : 'js/schedule_editor/schedule_editor.html?tag=201909132216'
          };
        });
});
