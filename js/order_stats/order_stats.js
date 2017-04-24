define('order_stats/order_stats', [
    'services', 'utils'], function() {
  return angular.module('OrderStatsModule', [
      'ServicesModule', 'UtilsModule'])
    .directive('orderStats', function($rootScope, rpc, utils) {
      function toMoney(num) {
        return parseFloat(num).toFixed(2);
      }
      return {
        link: function(scope) {
          scope.reload = function() {
            scope.years = [];
            scope.items = {};
            scope.year = new Date().getFullYear();
            for (var year = 2017; year <= scope.year; year++) {
              scope.years.push(year);
            }

            rpc.get_order_stats(scope.year).then(function(response) {
              var classes = response.data;
              if (!classes) return;

              rpc.get_items().then(function(response) {
                var items = response.data;
                utils.forEach(classes, function(classInfo) {
                  classInfo.sub_total = 0.00;
                  classInfo.total_count = 0;

                  utils.forEach(classInfo.stats, function(stat) {
                    scope.items[stat.item_id] = items[stat.item_id];
                    var groupCount = parseInt(stat.group_count);
                    classInfo.sub_total += 
                        groupCount * toMoney(stat.price);
                    classInfo.total_count += groupCount;
                  });
                  classInfo.sub_total = classInfo.sub_total.toFixed(2);
                });
                scope.items = utils.values(scope.items);
                scope.classes = classes;
              });
            });
          };
          
          $rootScope.$on('reload-orders', scope.reload);
          scope.reload();
        },
        templateUrl : 'js/order_stats/order_stats.html'
      };
    });
});
