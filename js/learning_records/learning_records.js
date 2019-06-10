define('learning_records/learning_records', [
    'navigate_bar/navigate_bar', 'services', 'utils',
    'zb_sync_button/zb_sync_button'], function() {
  return angular.module('LearningRecordsModule', ['NavigateBarModule',
      'ServicesModule',
      'UtilsModule',
      'ZBServicesModule',
      'ZBSyncButtonModule'])
    .directive('learningRecords',
        function(rpc, utils, zbrpc) {
          return {
            scope: {
              attendence: '@',
              classId: '='
            },
            link: function($scope) {
              var classInfo;

              $scope.showZBData = false;

              $scope.attendOptions = ['缺席', '出席', '请假'];
              $scope.vacation = function(schedule) {
                return !parseInt(schedule.course_id); 
              };

              $scope.$watch('classId', function() {
                $scope.reload();
              });
              
              $scope.reload = function(term) {
                $scope.showZBData = false;
                classInfo = window.classInfos[$scope.classId];
                rpc.get_schedules($scope.classId, term || 0, 'class')
                    .then(function(response) {
                  var group = utils.first(response.data.groups);
                  if (!group) return;

                  $scope.term = group.term;
                  $scope.schedule_groups = response.data.groups;
                  $scope.users = response.data.users;
                  group.courseMap = utils.toMap(group.courses, "zb_name");
                });
              };
              
              $scope.reportTask = function($event, user, course_id) {
                $event.stopPropagation();
                var record = user.records[course_id];
                record.student_id = user.id;
                record.course_id = course_id;
                rpc.report_schedule_task(record).then(function(response) {
                  if (!parseInt(response.data.updated)) {
                    $scope.reload($scope.term);
                  }
                });
              };

              $scope.navigate = function(direction) {
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
                $scope.reload(term);
              };

              $scope.exportCourse = function(group, course_ids, addSuffix) {
                var data = '';
                course_ids.forEach(function(course_id) {
                  data += '\t' + group.courses[course_id].name + '\t';
                });
                data += '\n';
                utils.forEach($scope.users, function(user) {
                  data += user.name;
                  var index = 0;
                  utils.forEach(course_ids, function(course_id) {
                    var suffix = addSuffix && (index++ >= course_ids.length/2+3) ?
                        'Z' : '';
                    var record = user.records[course_id];
                    var video = (record && record.video) ? '' : ('未听' + suffix);
                    var text = (record && record.text) ? '' : ('未看' + suffix);
                    data += '\t' + video + '\t' + text;
                  });
                  data += '\n';
                });
                return data;
              };
              $scope.getCourses = function(group, secondary) {
                var isNotVacation = function(schedule) {
                  return !$scope.vacation(schedule);
                };
                var getCourseId = function(schedule) {
                  return secondary && schedule.course_id2 || schedule.course_id;
                };
                return utils.map(utils.where(group.schedules, isNotVacation),
                    getCourseId);
              };
              function getCoursesAlt(group) {
                var result = [];
                utils.forEach(group.schedules, function(schedule) {
                  if ($scope.vacation(schedule)) return;

                  result.push(schedule.course_id);
                  if (schedule.course_id2) {
                    result.push(schedule.course_id2);
                  }
                });
                return result;
              }
              $scope.export = function() {
                utils.forEach($scope.schedule_groups, function(group) {
                  var course_ids = $scope.getCourses(group);
                  $scope.exportedRecords = utils.createDataUrl(
                      $scope.exportCourse(group, course_ids),
                      $scope.exportedRecords);
                  if (!parseInt(group.course_group2))
                    return;
                  var course_ids2 = $scope.getCourses(group, true);
                  $scope.exportedRecords2 = utils.createDataUrl(
                      $scope.exportCourse(group, course_ids2),
                      $scope.exportedRecords2);
                  var alt = getCoursesAlt(group);
                  $scope.exportedRecordsAlt = utils.createDataUrl(
                      $scope.exportCourse(group, alt, $scope.term == 1),
                      $scope.exportedRecordsAlt);
                });
              };
              function exportLimitedCourse(group) {
                var data = '';
                utils.forEach(group.limited_courses, function(course) {
                  data += '\t' + course.name + '\t';
                });
                data += '\n';
                utils.forEach($scope.users, function(user) {
                  data += user.name;
                  utils.forEach(group.limited_courses, function(course) {
                    var record = user.records[course.id];
                    var video = (record && record.video) ? '' : '未听Z';
                    var text = (record && record.text) ? '' : '未看Z';
                    data += '\t' + video + '\t' + text;
                  });
                  data += '\n';
                });
                return data;
              }
              $scope.exportLimitedCourse = function(group) {
                $scope.exportedLimitedRecords = utils.createDataUrl(
                    exportLimitedCourse(group),
                    $scope.exportedLimitedRecords);
              };

              function getCachedZBLessons(half_term) {
                classInfo.zb_lessons = classInfo.zb_lessons || {};
                return classInfo.zb_lessons[half_term];
              }

              function getZBLessons(half_term) {
                return function() {
                  if (getCachedZBLessons(half_term)) return utils.truePromise();

                  var courseId = zbrpc.get_course_id(classInfo.department_id);
                  return zbrpc.get_preclass_lessons(classInfo.zb_id, courseId, half_term)
                      .then(function(response) {
                        classInfo.zb_lessons[half_term] = response.data.data;
                        return true;
                      });
                };
              }

              function getCourseIdFromZBLesson(lesson) {
                var group = utils.first($scope.schedule_groups);
                var course = group.courseMap[lesson.name];
                return course && course.id;
              }

              /// Convert zb data like:
              /// {
              ///   audio173: "1",
              ///   audio174: "1",
              ///   book173: "1",
              ///   book174: "1"
              ///   userID: "123614"
              /// }
              /// to
              /// user.records
              /// {
              ///   schedule_id173: {video: true, text: true}, 
              ///   schedule_id174: {video: true, text: true}, 
              /// }
              function parseZBCourseResults(half_term, zbUser) {
                var user = {
                  zb_id: zbUser.userID, 
                  records: {}
                };
                var lessons = getCachedZBLessons(half_term);
                lessons.forEach(function(lesson) {
                  var course_id = getCourseIdFromZBLesson(lesson);
                  if (!course_id) {
                    console.log('"{0}"在学修系统中不存在，请改正'.format(lesson.name));
                    return;
                  }
                  user.records[course_id] = {
                    video: parseInt(zbUser['audio' + lesson.lesson_id]) == 1,
                    text: parseInt(zbUser['book' + lesson.lesson_id]) == 1
                  };
                });
                return user;
              }

              function auditUser(user, zbUser) {
                if (!zbUser) {
                  console.log('"{0}"在zhibei.info不存在，请修正'.format(user.name));
                  return;
                }
                for (var course_id in zbUser.records) {
                  var record = user.records[course_id] ||
                      (user.records[course_id] = {});
                  var zbRecord = zbUser.records[course_id];

                  record.audit = ((record.video || false) == (zbRecord.video || false)) &&
                      ((record.text || false) == (zbRecord.text || false));
                }
              }

              function getCachedZBCourseResults(half_term) {
                classInfo.zb_course_results = classInfo.zb_course_results || {};
                return classInfo.zb_course_results[half_term];
              }

              function getZBCourseResults(half_term) {
                return function() {
                  if (getCachedZBCourseResults(half_term)) return utils.truePromise();

                  return zbrpc.get_task_records(zbrpc.MAIN_GRID, classInfo.zb_id, half_term)
                      .then(function(response) {
                        var zbUsers = response.data.data.map(function(user) {
                          return parseZBCourseResults(half_term, user);
                        });
                        classInfo.zb_course_results[half_term] = utils.toMap(zbUsers, 'zb_id');
                        return true;
                      });
                };
              }

              /// Merges zb results of both the first half term and the
              /// second half term.
              function mergeZBRecords() {
                var zbUsers1 = getCachedZBCourseResults($scope.term * 2);
                var zbUsers2 = getCachedZBCourseResults($scope.term * 2 + 1);
                var merged = utils.map(zbUsers1, function(user) {
                  var user2 = zbUsers2[user.zb_id];
                  return {
                    zb_id: user.zb_id,
                    records: utils.mix_in(user2.records, user.records)
                  };
                });
                return utils.toMap(merged, 'zb_id');
              }

              function auditUsers() {
                var zbUsers = mergeZBRecords();
                utils.forEach($scope.users, function(user) {
                  auditUser(user, zbUsers[user.zb_id]);
                });
                $scope.loading = false;
                return utils.truePromise();
              }

              $scope.getZbData = function() {
                $scope.showZBData = !$scope.showZBData;
                if (!$scope.showZBData) return;

                $scope.loading = true;
                var half_terms = [$scope.term * 2, $scope.term * 2 + 1];
                var requests = [zbrpc.ensure_authenticated];
                requests = requests.concat(half_terms.map(getZBLessons));
                requests = requests.concat(half_terms.map(getZBCourseResults));
                requests.push(auditUsers);
                utils.requestOneByOne(requests);
              };

              function audited(user, courseId) {
                return !parseInt(courseId) || user.records[courseId].audit;
              }

              $scope.audited = function(user, schedule) {
                if (!$scope.showZBData || $scope.loading) return true;

                return audited(user, schedule.course_id) &&
                    audited(user, schedule.course_id2);
              };
            },
            templateUrl : 'js/learning_records/learning_records.html?tag=201911132208'
          };
        });
});
