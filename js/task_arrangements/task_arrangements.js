define('task_arrangements/task_arrangements', ['services', 'utils'],
    function() {
  return angular.module('TaskArrangementsModule', ['ServicesModule',
      'UtilsModule']).directive('taskArrangements', function(rpc, utils) {
      return {
        scope: {
          classId: '='
        },
        link: function(scope) {
          scope.half_terms = [];
          scope.termLabels = [''];
          scope.task_arrange = {};
          for (var term = 1; term < 9; term++) {
            var label = '第{0}学期{1}半学期';
            scope.termLabels.push(label.format(term, '上'));
            scope.termLabels.push(label.format(term, '下'));
            scope.half_terms.push(term * 2);
            scope.half_terms.push(term * 2 + 1);
          }

          scope.isNotEmpty = function() {
        	    return !utils.isEmpty(scope.tasks);
          };

          scope.$watch('classId', function() {
        	    console.log('1. classId changed to ' + scope.classId);
        	    scope.loadTasks();
          });
          
          function getClassInfo() {
              return rpc.get_classes(scope.classId).then(function(response) {
                  return scope.classInfo = response.data[scope.classId];
              });
          }
          
          function getTasks() {
            return rpc.get_tasks(scope.classInfo.department_id)
                .then(function(response) {
              return scope.tasks = response.data;
            });
          }
          
          function getTaskArranges() {
              scope.task_arrange = {};
              return rpc.get_task_arranges(scope.classInfo.id)
                  .then(function(response) {
                scope.task_arrange = response.data;
                utils.forEach(scope.tasks, function(task) {
                  var arrange = scope.task_arrange[task.id];
                  if (!arrange) {
                    if (task.starting_half_term >= scope.half_terms.length) {
                    	  return;
                    	}
                    scope.task_arrange[task.id] = arrange = {
                      start_half_term: task.starting_half_term,
                      report_half_term: task.report_half_term,
                      task_id: task.id
                    };
                  } else {
              	    arrange.start_half_term = parseInt(arrange.start_half_term) ||
              	        task.starting_half_term; 
              	    arrange.report_half_term = parseInt(arrange.report_half_term) ||
              	        task.report_half_term; 
                  }
                });
                return true;
            });
          }

          scope.loadTasks = function() {
        	    console.log('classId changed to ' + scope.classId);
            if (!scope.classId) return;
            utils.requestOneByOne([getClassInfo, getTasks, getTaskArranges]);
          };
              
          scope.updateTaskArrange = function(task_id, task_arrange) {
              rpc.update_task_arranges(scope.classInfo.id, task_id,
                  task_arrange.start_half_term,
                  task_arrange.report_half_term).then(function(response) {
                    if (!parseInt(response.data.updated)) {
                      scope.loadTasks();
                    }
                  });
          };
        },
        templateUrl: 'js/task_arrangements/task_arrangements.html?tag=201707031255'
      };
    });
});
