define('shopping_cart/shopping_cart', [
    'address_editor/address_editor',
    'districts/districts',
    'payment/payment',
    'services', 'utils'], function() {
  return angular.module('ShoppingCartModule', [
      'AddressEditorModule', 'DistrictsModule',
      'PaymentModule',
      'ServicesModule', 'UtilsModule'])
    .directive('shoppingCart', function($rootScope, rpc, utils) {
      return {
        scope: {
          cart: '=',
          refill: '@',
          user: '='
        },
        link: function(scope, element) {
          scope.ME = 'me';
          scope.GROUP = 'group';
          scope.PICKUP = 'pickup';

          scope.confirming = false;
          scope.addrEditor = {};
          scope.shipTo = scope.ME;
          
          var items = {};
          
          function showPaymentWindow(orderId) {
            var toast = document.querySelector('#toast1');
            toast && toast.open();
            rpc.get_order(orderId).then(function(response) {
              scope.order = response.data;
              scope.order.items.forEach(function(item) {
                item.name = items[item.item_id].name;
              });
              utils.calculate_order_values(scope.order);
            });
          }

          scope.checkOut = function(payNow) {
            if (!scope.confirming) {
              scope.confirming = true;
              return;
            }
            var user = scope.user;
            if (scope.shipTo != scope.ME) {
              if (!user.district) {
                alert('请选择地方组');
                return;
              }
            } else {
              if (!user.name || !user.street || !user.city ||
                  !user.zip) {
                alert('请输入完整收货信息.');
                scope.addrEditor.editing = true;
                return;
              }
            }
            var options = {
              refill: scope.refill,
              payNow: payNow,
              localPickup: scope.shipTo == scope.PICKUP
            };
            utils.mix_in(items, scope.cart.items);
            scope.cart.checkOut(user, options).then(function(orderId) {
              if (!orderId) return;
              $rootScope.$broadcast('reload-orders');
              if (payNow) {
                showPaymentWindow(orderId);
              } else if (scope.refill) {
                clear();
              } else {
                var toast = document.querySelector('#toast0');
                toast && toast.open();
                scope.showOrders();
              }
            });
          };

          scope.updateShipMethod = function(shipTo) {
            scope.shipTo = shipTo;
            if (shipTo == scope.PICKUP) {
              scope.cart.shipping = 0.00;
            } else if (shipTo == scope.ME) {
              scope.user.district = null;
              scope.cart.update();
            } else {
              scope.cart.update();
            }
          };

          function clear() {
            scope.order = null;
            scope.confirming = false;
          }

          scope.showOrders = function() {
            clear();

            scope && setTimeout(function() {
              document.querySelector('paper-tabs').selected = 2;
            }, 3000);
          };

          scope.updateOrder = function() {
            rpc.update_order(scope.order).then(function(response) {
              clear();
              if (response.data.updated) {
                $rootScope.$broadcast('reload-orders');
                var toast = document.querySelector('#toast2');
                toast && toast.open();
                scope.showOrders();
              } else {
                alert(response.data.error);
              }
            });
          };
        },
        templateUrl : 'js/shopping_cart/shopping_cart.html?tag=201809251253'
      };
    });
});
