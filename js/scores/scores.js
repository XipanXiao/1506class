define('scores/scores', ['services', 'utils'], function() {

  return angular.module('ScoresModule', ['ServicesModule', 'UtilsModule'])
        .directive('scores', function(rpc, utils) {
      return {
        scope: {
          classId: '@'
        },
        restrict: 'E',
        link: function(scope) {
          scope.types = ['', '闭卷', '开卷'];
          scope.$watch('classId', function(classId) {
            if (!classId) return;

            rpc.get_users(null, classId).then(function(response) {
              scope.users = response.data;

              rpc.get_scores(classId).then(function(response) {
                utils.forEach(scope.users, function(user) {
                  var score = response.data[user.id];
                  if (score) utils.mix_in(user, score);
                });
              });
            });
          });
        },
        templateUrl : 'js/scores/scores.html'
      };
    });
});
