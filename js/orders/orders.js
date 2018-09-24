define('orders/orders', [
    'districts/districts',
    'order_details/order_details',
    'services', 'permission', 'utils'], function() {
  return angular.module('OrdersModule', ['DistrictsModule',
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
          scope.filters = {};

          for (var year = 2017; year <= (scope.year || 0); year++) {
            scope.years.push(year);
          }
          
          function get_items() {
            return rpc.get_items(null, 99).then(function(response) {
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
                init_item_labels(order);
                calculate_order_values(order);
              });
              orders.forEach(function(order) {
                order.mergeable = !order.usps_track_id && 
                    scope.orders_of_users[order.user_id] > 1;
              });
              calculate_stats(orders);
              return scope.orders = orders;
            });
          }
          
          function collect_order_info(order) {
            scope.orders_of_users[order.user_id] = 
              (scope.orders_of_users[order.user_id] || 0) + 1;
            scope.orderIds.push(order.id);
            scope.classNames[order.class_name] = order.class_name;
            scope.phones[order.phone] = order.phone;
          }
          
          function summarize_order(order) {
            order.sub_total = 0.0;
            order.shipping = 0.0;
            for (let item of order.items) {
              item.count = parseInt(item.count);
              order.sub_total += item.count * parseMoney(item.price);
              order.shipping += item.count * parseMoney(item.shipping);
            }
          }

          function calculate_order_values(order) {
            order.status = parseInt(order.status);
            summarize_order(order);
            order.district = parseInt(order.district) || 0;
            order.sub_total = parseMoney(order.sub_total).toFixed(2);
            order.shipping = parseMoney(order.shipping).toFixed(2);
            order.int_shipping = parseMoney(order.int_shipping).toFixed(2);
            order.paid = parseMoney(order.paid).toFixed(2);

            order.grand_total = parseMoney(order.sub_total) + 
                parseMoney(order.shipping);
            order.grand_total = order.grand_total.toFixed(2);
            order.balance = 
                parseMoney(order.grand_total) - parseMoney(order.paid);
            order.balance = order.balance.toFixed(2);
          }

          function init_item_labels(order) {
            order.count = 0;
            order.shipping_estmt = 0.0;
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
              order.shipping_estmt += 
                  parseInt(item.count) * parseMoney(item.shipping);
            });
            order.int_shipping_estmt = order.int_shipping_estmt.toFixed(2);
            order.shipping_estmt = order.shipping_estmt.toFixed(2);
          }
          
          function calculate_stats(orders) {
            var stats = scope.stats = {
              count: 0,
              sub_total: 0.00,
              grand_total: 0.00,
              shipping: 0.00,
              items: {},
            };
            orders.forEach(function(order) {
              order.items.forEach(function(item) {
                var item_id = item.item_id;
                /// The items in the items db.
                var info = scope.items[item_id];
                var stat = stats.items[item_id]; 
                if (!stat) {
                  stat = stats.items[item_id] = {};
                  stat.name = info && info.name;
                }
                var price = parseMoney(item.price);
                stat.count = (stat.count || 0) + parseInt(item.count);
                stat.sub_total = (stat.sub_total || 0.00) + price * item.count;
                stat.shipping = (stat.shipping || 0.00) + 
                    parseMoney(item.shipping || 0.0) * item.count;
              });
            });
            utils.forEach(stats.items, function(item) {
              stats.count += item.count;
              stats.sub_total += item.sub_total;
              stats.shipping += item.shipping;

              item.sub_total = item.sub_total.toFixed(2);
              item.shipping = item.shipping.toFixed(2);
            });
            stats.grand_total = stats.sub_total + stats.shipping; 
            stats.sub_total = stats.sub_total.toFixed(2);
            stats.shipping = stats.shipping.toFixed(2);
            stats.grand_total = stats.grand_total.toFixed(2);
          }
          
          scope.reload = function() {
            if (!scope.user) return;

            scope.orderIds = [];
            scope.phones = {};
            scope.classNames = {};
            // How many orders each user has.
            scope.orders_of_users = {};

            utils.requestOneByOne([get_items, get_orders]);
          };

          /// Returns true if an order has neither paid or shipped.
          function canRemove(order) {
            return parseMoney(order.paid) < 0.01 &&
                !order.usps_track_id &&
                !order.paypal_trans_id;
          }
          
          scope.remove = function(order) {
            if (order.status == 3) {
              if (!confirm('请确认将订单#{0}存档'.format(order.id))) return;
              rpc.update_order({id: order.id, status: 7}).then((response) => {
                if (response.data.updated) {
                  orderDeleted(order);
                }
              });
              return;
            }

            if (!canRemove(order)) {
              alert('不能删除已经付款或发货的订单');
              return;
            }
            if (!confirm('请确认您要删除订单#{0}'.format(order.id))) return;

            utils.requestOneByOne([deleteOrderRequest(order)]);
          };
          
          function sendEmail(order) {
      	    var data = {
              email: order.email,
  	          order_id: order.id,
  	          usps_track_id: order.usps_track_id
      	    };
            return emailjs.send("bicw_notification", "order_receipt",
  	          data).then(() => false, (error) => {
  	          alert('发送邮件失败(一般因为发的人太多，' +
  	        		  '用完了名额，只好麻烦您自己动手了): ' +
  	        		  error && error.service_error);
  	          return false;
  	        });
          }

          scope.update = function(order) {
            var statusChanged = order.status != scope.status;
            // The order is marked as paid but with a non-zero balance.
            if (statusChanged && (order.status & 2) &&
              parseFloat(order.balance) > 0) {
              alert('余额没有付清，欠款$' + order.balance);
              order.status = scope.status;
              return;
            }
            var paidOff = parseFloat(order.paid) >= parseFloat(order.grand_total);
            if (paidOff && !order.status) {
              order.status = 2;
              statusChanged = true;
            }
            var shipped = false;
            if (order.usps_track_id && order.status == 2 && !statusChanged) {
              order.status = 3;
              statusChanged = true;
              shipped = true;
            }
            rpc.update_order(order).then(function(response) {
              if (!response.data.updated) return;
              if (statusChanged) {
                if (shipped && scope.admin) {
                  sendEmail(order);
                }
                $rootScope.$broadcast('reload-orders');
              } else {
                order.editing = false;
                calculate_order_values(order);
              }
            });
          };
          
          function reloadOrderRequest(order) {
            return function() {
              return rpc.get_order(order.id).then(function(response) {
                utils.mix_in(order, response.data);
                init_item_labels(order);
                calculate_order_values(order);
                return order;
              });
            }
          }
          function moveItemsRequest(fromOrder, toOrder) {
            return function() {
              return rpc.move_order_items(fromOrder, toOrder)
                  .then(function(response) {
                return response.data.updated;
              });
            }
          };
          function orderDeleted(order) {
            var index = scope.orders.indexOf(order);
            scope.orders.splice(index, 1);
            $rootScope.$broadcast('order-deleted');
            return true;
          }
          function deleteOrderRequest(order) {
            return function() {
              return rpc.remove_order(order.id).then(function(response) {
                if (!response.data.deleted) return false;
                return orderDeleted(order);
              });
            }
          };
          scope.merge = function(order) {
            var message = '请确认把"{0}"的所有其他订单合并到本订单'.format(order.name); 
            if (!confirm(message)) return;

            order.mergeable = false;
            var requests = [];
            scope.orders.forEach(function(another) {
              if (another.user_id != order.user_id || another.id == order.id ||
                  another.zip != order.zip) return;
              if (!canRemove(another)) {
                alert('将跳过#{0}订单，因为已经付款或者发货'.format(another.id));
                return;
              }

              another.mergeable = false;
              another.items.forEach(function(item) { item.selected = true; });
              requests.push(moveItemsRequest(another, order));
              requests.push(deleteOrderRequest(another));
            });
            requests.push(reloadOrderRequest(order));
            utils.requestOneByOne(requests);
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

          
          /// Creates a new order of same information of order with no items.
          function _createOrderFrom(order) {
            var splitOrder = {
              sub_total: 0.0,
              int_shipping: 0.0,
              shipping: 0.0,
              paid: 0.0,
              status: order.status,
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
              paypal_trans_id: order.paypal_trans_id,
              items: []
            };
            return splitOrder;
          }

          scope.split = function(order) {
            if (order.status || order.usps_track_id) {
              alert('不能拆分已经发货的订单');
              return;
            }

            var splitOrder = _createOrderFrom(order);

            var placeSplitOrder = function() {
              return rpc.update_order(splitOrder).then(function(response) {
                splitOrder.id = response.data.updated;
                if (!splitOrder.id) return false;

                splitOrder.mergeable = true;
                order.mergeable = true;
                var index = scope.orders.indexOf(order);
                scope.orders.splice(index + 1, 0, splitOrder);
                return true;
              });
            };
            
            var requests = [placeSplitOrder,
                moveItemsRequest(order, splitOrder),
                reloadOrderRequest(order),
                reloadOrderRequest(splitOrder)];
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
              order.shipping = (parseMoney(order.shipping) - 
                  item.count * item.shipping).toFixed(2);

              var index = order.items.indexOf(item);
              order.items.splice(index, 1);

              init_item_labels(order);
              calculate_order_values(order);

              var data = {
                id: order.id,
                sub_total: order.sub_total,
                int_shipping: order.int_shipping,
                shipping: order.shipping
              };
              return rpc.update_order(data);
            };
            return utils.requestOneByOne([removeItem, updateOrder]);
          }
          
          
          scope.exportAddresses = function() {
            var pinyinTable;

            const getPinyinTable = () => 
                rpc.get_pinyin_table().then((map) => pinyinTable = map);
                
            const clean = (s) => s.replaceAll(',', ''); 

            const getAddress = (order) => {
              var name = utils.getPinyinName(order.name, pinyinTable);
              utils.setCountryLabels(order);
              return '{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}\n'.
                  format(clean(name[0]), clean(name[1] || ''),
              clean(order.street), clean(order.city),
              clean(order.stateLabel), clean(order.zip),
              clean(order.countryLabel), clean(order.phone),
              clean(order.email), order.id);
            };

            const filteredField = (order, field) => {
              var filterValue = (scope.filters[field] || '').
                  toString().toLowerCase();
              if (!filterValue) return true;
              var value = order[field].toString().toLowerCase();
              return value.indexOf(filterValue) >= 0;
            };

            const filtered = (order) => {
              return filteredField(order, 'id') &&
                  filteredField(order, 'phone') &&
                  filteredField(order, 'class_name') &&
                  (!scope.filters.district_enabled ||
                      filteredField(order, 'district'));
              };

              const exportData = () => {
                  var data = 'First Name,Last Name,Address 1,City,State/Province,' +
                    'ZIP/Postal Code,Country,Phone Number,E Mail,Reference Number\n';
                var orders = utils.where(scope.orders, filtered);
                utils.forEach(orders, (order) => data += getAddress(order));
                scope.addressDataUrl = utils.createDataUrl(data, scope.addressDataUrl);
                return utils.truePromise();
              };
              utils.requestOneByOne([getPinyinTable, exportData]);
          };

          $rootScope.$on('reload-orders', scope.reload);
          scope.$watch('user', scope.reload);
        },
        templateUrl : 'js/orders/orders.html?tag=201809231000'
      };
    });
});
