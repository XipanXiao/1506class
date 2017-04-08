define('orders/orders', [
    'order_details/order_details',
    'services', 'utils'], function() {
  return angular.module('OrdersModule', [
      'OrderDetailsModule', 'ServicesModule', 'UtilsModule'])
    .directive('orders', function($rootScope, rpc, utils) {
      return {
        scope: {
          user: '=',
        },
        link: function(scope) {
          scope.reload = function() {
            if (!scope.user) return;

            rpc.get_orders(scope.user.id, true).then(function(response) {
              var orders = response.data;
              if (!orders) return;
              rpc.get_items().then(function(response) {
                var items = response.data;
                orders.forEach(function(order) {
                  order.status = parseInt(order.status);
                  order.items.forEach(function(item) {
                    utils.mix_in(item, items[item.item_id]);
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

          $rootScope.$on('reload-orders', scope.reload);
          scope.$watch('user', scope.reload);
        },
        templateUrl : 'js/orders/orders.html'
      };
    });
});
