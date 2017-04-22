define('orders/orders', [
    'order_details/order_details',
    'services', 'utils'], function() {
  return angular.module('OrdersModule', [
      'OrderDetailsModule', 'ServicesModule', 'UtilsModule'])
    .directive('orders', function($rootScope, rpc, utils) {
      function getTimestampRange(year) {
        if (!year) return {};

        var start = Math.floor(Date.UTC(year, 0)/1000.0);
        var end = Math.floor(Date.UTC(year+1, 0)/1000.0);
        return {start: start, end: end};
      }
      function parseMoney(value) {
        return value && parseFloat(value) || 0.00;
      }
      return {
        scope: {
          admin: '@',
          status: '@',
          user: '=',
          year: '='
        },
        link: function(scope) {
          scope.years = [];
          scope.orderIds = [];
          scope.phones = [];

          for (var year = 2017; year <= (scope.year || 0); year++) {
            scope.years.push(year);
          }
          scope.reload = function() {
            if (!scope.user) return;

            var filters = {items: true, status: scope.status};
            utils.mix_in(filters, getTimestampRange(scope.year));
            var user_id = !scope.admin && scope.user.id;
            rpc.get_orders(user_id, filters).then(function(response) {
              var orders = response.data;
              if (!orders) return;
              rpc.get_items().then(function(response) {
                var items = response.data;
                orders.forEach(function(order) {
                  order.status = parseInt(order.status);

                  order.sub_total = parseMoney(order.sub_total);
                  order.shipping = parseMoney(order.shipping);
                  order.paid = parseMoney(order.paid);

                  scope.orderIds.push(order.id);
                  if (scope.phones.indexOf(order.phone) < 0) {
                    scope.phones.push(order.phone);
                  }
                  order.items.forEach(function(item) {
                    var info = items[item.item_id];
                    item.image = info.image;
                    item.name = info.name;
                    item.producer = info.producer;
                  });
                });
                scope.orders = orders;
              });
            });
          };
          
          scope.remove = function(order) {
            rpc.remove_order(order.id).then(function(response) {
              if (response.data.deleted) {
                var index = scope.orders.indexOf(order);
                scope.orders.splice(index, 1);
              }
            });
          };
          
          scope.update = function(order) {
            rpc.update_order(order).then(function(response) {
              if (response.data.updated) {
                $rootScope.$broadcast('reload-orders');
              }
            });
          };

          $rootScope.$on('reload-orders', scope.reload);
          scope.$watch('user', scope.reload);
        },
        templateUrl : 'js/orders/orders.html'
      };
    });
});
