define('score/score', ['services', 
    'utils'], function() {

  return angular.module('ScoreModule', ['ServicesModule',
      'UtilsModule'])
        .directive('score', function(rpc, utils) {
      return {
        restrict: 'E',
        link: function(scope) {
          scope.types = utils.examLabels;
          scope.record = {};

          rpc.get_scores().then(function(response) {
            var score = response.data;
            if (!score) return;

            score.type1 = parseInt(score.type1) || 0;
            score.type2 = parseInt(score.type2) || 0;
            score.score1 = parseInt(score.score1) || 0;
            score.score2 = parseInt(score.score2) || 0;
            
            scope.score = score;
          });

          rpc.attendanceStats().then(function(response) {
            var stat = scope.record = response.data || {};
            var total = parseInt(stat.total);
            if (total) {
              stat.ratio = (parseInt(stat.attended) * 100.0 / total).toFixed(2);
            }
          });
        },
        templateUrl : 'js/score/score.html?tag=201905122003'
      };
    });
});
