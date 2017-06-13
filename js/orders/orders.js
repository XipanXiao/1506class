define('orders/orders', [
    'order_details/order_details',
    'services', 'permission', 'utils'], function() {
  return angular.module('OrdersModule', [
      'OrderDetailsModule', 'ServicesModule', 'UtilsModule'])
    .directive('orders', function($rootScope, rpc, perm, utils) {
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
            if (!perm.isOrderAdmin()) {
              filters.class_id = scope.user.classId;
            }
            return rpc.get_orders(user_id, filters).then(function(response) {
              var orders = response.data || [];
              orders.forEach(function(order) {
                collect_order_info(order);
                calculate_order_values(order);
                init_item_labels(order);
              });
              orders.forEach(function(order) {
                order.mergeable = scope.orders_of_users[order.user_id] > 1;
              });
              calculate_stats(orders);
              return scope.orders = orders;
            });
          }
          
          function collect_order_info(order) {
            scope.orders_of_users[order.user_id] = 
              (scope.orders_of_users[order.user_id] || 0) + 1;
            scope.orderIds.push(order.id);
            if (scope.phones.indexOf(order.phone) < 0) {
              scope.phones.push(order.phone);
            }
          }
          
          function calculate_order_values(order) {
            order.status = parseInt(order.status);
            order.sub_total = parseMoney(order.sub_total).toFixed(2);
            order.shipping = parseMoney(order.shipping).toFixed(2);
            order.int_shipping = parseMoney(order.int_shipping).toFixed(2);
            order.paid = parseMoney(order.paid).toFixed(2);

            order.grand_total = parseMoney(order.sub_total) + 
                parseMoney(order.int_shipping) + parseMoney(order.shipping);
            order.grand_total = order.grand_total.toFixed(2);
            order.balance = 
                parseMoney(order.grand_total) - parseMoney(order.paid);
            order.balance = order.balance.toFixed(2);
          }

          function init_item_labels(order) {
            order.count = 0;
            order.int_shipping_estmt = 0.0;
            order.items.forEach(function(item) {
              var info = scope.items[item.item_id];
              if (info) {
                item.image = info.image;
                item.name = info.name;
                item.producer = info.producer;
                item.int_shipping = info.int_shipping;
              }
              order.count += parseInt(item.count);
              order.int_shipping_estmt += 
                  parseInt(item.count) * parseMoney(item.int_shipping);
            });
            order.int_shipping_estmt = order.int_shipping_estmt.toFixed(2);
          }
          
          function calculate_stats(orders) {
            var stats = scope.stats = {
              count: 0,
              sub_total: 0.00,
              grand_total: 0.00,
              int_shipping: 0.00,
              int_shipping_estmt: 0.00,
              items: {},
            };
            orders.forEach(function(order) {
              stats.int_shipping += parseMoney(order.int_shipping);
              order.items.forEach(function(item) {
                var item_id = item.item_id;
                /// The items in the items db.
                var info = scope.items[item_id];
                var stat = stats.items[item_id]; 
                if (!stat) {
                  stat = stats.items[item_id] = {};
                  stat.name = info && info.name;
                  stat.price = info && info.price || 0.0;
                }
                var price = parseMoney(item.price);
                stat.count = (stat.count || 0) + parseInt(item.count);
                stat.sub_total = (stat.sub_total || 0.00) + price * item.count;
                stat.int_shipping_estmt = (stat.int_shipping_estmt || 0) + 
                    parseMoney(info && info.int_shipping || 0.0) * 
                    item.count;
              });
            });
            utils.forEach(stats.items, function(item) {
              stats.count += item.count;
              stats.sub_total += item.sub_total;
              stats.int_shipping_estmt += item.int_shipping_estmt;

              item.sub_total = item.sub_total.toFixed(2);
              item.int_shipping_estmt = item.int_shipping_estmt.toFixed(2);
            });
            stats.sub_total = stats.sub_total.toFixed(2);
            stats.int_shipping = stats.int_shipping.toFixed(2);
            stats.int_shipping_estmt = stats.int_shipping_estmt.toFixed(2);
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
            var statusChanged = order.status != scope.status;
            rpc.update_order(order).then(function(response) {
              if (!response.data.updated) return;
              if (statusChanged) {
                $rootScope.$broadcast('reload-orders');
              } else {
                order.editing = false;
                calculate_order_values(order);
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
          
          scope.breakUp = function() {
            var stats = scope.stats;
            if (!stats.actual_int_shipping || !stats.int_shipping_estmt) return;

            var actualShipping = 0.0;
            var ratio = stats.actual_int_shipping / stats.int_shipping_estmt;
            scope.orders.forEach(function(order) {
              order.int_shipping = (Math.floor(order.int_shipping_estmt * 
                  ratio * 1e2 + 0.5) / 1e2).toFixed(2);
              actualShipping += parseMoney(order.int_shipping); 
            });
            scope.orders[0].int_shipping = 
                (parseMoney(scope.orders[0].int_shipping) + 
                stats.actual_int_shipping - actualShipping).toFixed(2);
            stats.int_shipping = stats.actual_int_shipping.toFixed(2);
          };
          
          scope.save = function() {
            function toRequest(order) {
              return function() {
                return rpc.update_order({
                  id: order.id, 
                  int_shipping: order.int_shipping
                });
              };
            }
            var requests = scope.orders.map(toRequest);
            utils.requestOneByOne(requests).then(scope.reload);
          };
          
          scope.isOrderAdmin = function() {
            return perm.isOrderAdmin();
          };

          
          /// Creates a new order and moves selected items from [order] to
          /// the created order.
          function _createSplitOrder(order) {
            var splitOrder = {
              sub_total: 0.0,
              int_shipping: 0.0,
              status: 0,
              user_id: order.user_id,
              name: order.name,
              class_name: order.class_name,
              phone: order.phone,
              email: order.email,
              street: order.street,
              city: order.city,
              state: order.state,
              country: order.country,
              zip: order.zip,
              items: []
            };
            order.items.forEach(function(item) {
              if (!item.selected) return;
            
              splitOrder.sub_total += item.count * item.price;
              splitOrder.int_shipping += item.count * item.int_shipping;
              splitOrder.items.push({
                item_id: item.item_id, 
                price: item.price, 
                count: item.count
              });
            });

            var grandTotal = splitOrder.sub_total + splitOrder.int_shipping;
            if (parseMoney(order.paid) >= grandTotal) {
              order.paid = (parseMoney(order.paid) - grandTotal).toFixed(2);
              splitOrder.paid = grandTotal;
              splitOrder.paypal_trans_id = order.paypal_trans_id;
            }
            return splitOrder;
          }

          scope.split = function(order) {
            var placeSplitOrder = function() {
              var splitOrder = _createSplitOrder(order);
              return rpc.update_order(splitOrder).then(function(response) {
                splitOrder.id = response.data.updated;
                if (!splitOrder.id) return false;

                order.mergeable = true;
                splitOrder.mergeable = true;
                calculate_order_values(splitOrder);
                init_item_labels(splitOrder);

                var index = scope.orders.indexOf(order);
                scope.orders.splice(index + 1, 0, splitOrder);
                return true;
              });
            };

            var requests = [placeSplitOrder];
            order.items.forEach(function(item) {
              if (!item.selected) return;
              
              var removeItem = function() {
                item.selected = false;
                return _removeOrderItem(order, item);
              };
              requests.push(removeItem);
            });

            utils.requestOneByOne(requests);
          };

          /// Removes [item] from order, updates order valeus.
          scope.removeOrderItem = function(order, item) {
            if (parseMoney(order.balance) < 0.01) {
              alert('不能删除已经付清的条目');
              return;
            }
            if (order.count == 1) {
              alert('请删除整个订单');
              return;
            }
            if (!confirm('请确认删除"{0}"'.format(item.name))) return;
            
            _removeOrderItem(order, item);
          };
          
          function _removeOrderItem(order, item) {
            var removeItem = function() {
              return rpc.remove_order_item(item.id).then(function(response) {
                return response.data.deleted;
              });
            };
            var updateOrder = function() {
              order.sub_total = (parseMoney(order.sub_total) - 
                  item.count * item.price).toFixed(2);
              order.int_shipping = (parseMoney(order.int_shipping) - 
                  item.count * item.int_shipping).toFixed(2);

              var index = order.items.indexOf(item);
              order.items.splice(index, 1);

              calculate_order_values(order);
              init_item_labels(order);

              var data = {
                id: order.id,
                sub_total: order.sub_total,
                int_shipping: order.int_shipping
              };
              return rpc.update_order(data);
            };
            return utils.requestOneByOne([removeItem, updateOrder]);
          }

          $rootScope.$on('reload-orders', scope.reload);
          scope.$watch('user', scope.reload);
        },
        templateUrl : 'js/orders/orders.html?tag=201706042211'
      };
    });
});
