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

          for (var year = 2017; year <= (scope.year || 0); year++) {
            scope.years.push(year);
          }
          scope.reload = function() {
            if (!scope.user) return;

            scope.orderIds = [];
            scope.phones = [];

            var filters = {items: true, status: scope.status};
            utils.mix_in(filters, getTimestampRange(scope.year));
            var user_id = !scope.admin && scope.user.id;
            rpc.get_orders(user_id, filters).then(function(response) {
              var orders = response.data;
              if (!orders) return;
              rpc.get_items().then(function(response) {
                var items = response.data;

                // How many orders a user has.
                var orders_of_users = {};

                orders.forEach(function(order) {
                  order.status = parseInt(order.status);
                  orders_of_users[order.user_id] = 
                      (orders_of_users[order.user_id] || 0) + 1;

                  order.sub_total = parseMoney(order.sub_total);
                  order.int_shipping = parseMoney(order.int_shipping);
                  order.shipping = parseMoney(order.shipping);
                  order.paid = parseMoney(order.paid);
                  
                  order.grand_total = (order.sub_total + order.int_shipping +
                      order.shipping).toFixed(2);
                  order.balance = (order.grand_total - order.paid).toFixed(2);

                  scope.orderIds.push(order.id);
                  if (scope.phones.indexOf(order.phone) < 0) {
                    scope.phones.push(order.phone);
                  }

                  order.count = 0;
                  order.items.forEach(function(item) {
                    var info = items[item.item_id];
                    item.image = info.image;
                    item.name = info.name;
                    item.producer = info.producer;
                    order.count += parseInt(item.count);
                  });
                });
                
                orders.forEach(function(order) {
                  if (orders_of_users[order.user_id] > 1) {
                    order.mergeable = true;
                  }
                });
                scope.orders = orders;
              });
            });
          };
          
          scope.remove = function(order) {
            if (!confirm('请确认您要删除订单#{0}'.format(order.id))) return;

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
          
          scope.merge = function(order) {
            var message = '请确认要合并"{0}"的所有相同地址新订单'.format(order.name); 
            if (!confirm(message)) return;

            var user_id = order.user_id;
            var orders = utils.where(scope.orders, function(order) {
              return order.user_id == user_id;
            });
            var orderIds = utils.map(orders, function(order) {return order.id});
            rpc.merge_orders(orderIds).then(function(response) {
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
