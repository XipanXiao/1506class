angular.module('UserAttendStatsModule', ['ServicesModule'])
.directive('userAttendStats', function(rpc) {
  return {
    scope: {
      userId: '='
    },
    link: function(scope) {
      scope.stats = {};
      scope.$watch('userId', init);

      function init(userId) {
        rpc.attendanceStats(userId).then(function(response) {
          var stat = scope.stats = response.data || {};
          var total = parseInt(stat.total);
          if (total) {
            stat.ratio = (parseInt(stat.attended) * 100.0 / total).toFixed(2);
          }
        });
      }
    },
    template: '{{stats.attended}}/{{stats.total}}({{stats.ratio}}%)'
  };
});
