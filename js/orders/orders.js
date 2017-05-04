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
          
          function get_items() {
            return rpc.get_items().then(function(response) {
              return scope.items = response.data;
            });
          }
          
          function get_orders() {
            var filters = {items: true, status: scope.status};
            utils.mix_in(filters, getTimestampRange(scope.year));
            var user_id = !scope.admin && scope.user.id;
            return rpc.get_orders(user_id, filters).then(function(response) {
              var orders = response.data || [];
              orders.forEach(function(order) {
                calculate_order_values(order);
                init_item_labels(order);
              });
              orders.forEach(function(order) {
                order.mergeable = scope.orders_of_users[order.user_id] > 1;
              });
              return scope.orders = orders;
            });
          }
          
          function calculate_order_values(order) {
            order.status = parseInt(order.status);
            scope.orders_of_users[order.user_id] = 
                (scope.orders_of_users[order.user_id] || 0) + 1;

            order.grand_total = parseMoney(order.sub_total) + 
                parseMoney(order.int_shipping) + parseMoney(order.shipping);
            order.grand_total = order.grand_total.toFixed(2);
            order.balance = 
                parseMoney(order.grand_total) - parseMoney(order.paid);
            order.balance = order.balance.toFixed(2);

            scope.orderIds.push(order.id);
            if (scope.phones.indexOf(order.phone) < 0) {
              scope.phones.push(order.phone);
            }
          }

          function init_item_labels(order) {
            order.count = 0;
            order.int_shipping_estmt = 0.0;
            order.items.forEach(function(item) {
              var info = scope.items[item.item_id];
              item.image = info.image;
              item.name = info.name;
              item.producer = info.producer;
              item.int_shipping = info.int_shipping;
              order.count += parseInt(item.count);
              order.int_shipping_estmt += 
                  parseInt(item.count) * parseMoney(item.int_shipping);
            });
            order.int_shipping_estmt = order.int_shipping_estmt.toFixed(2);
          }
          
          scope.reload = function() {
            if (!scope.user) return;

            scope.orderIds = [];
            scope.phones = [];
            // How many orders each user has.
            scope.orders_of_users = {};

            utils.requestOneByOne([get_items, get_orders]);
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
