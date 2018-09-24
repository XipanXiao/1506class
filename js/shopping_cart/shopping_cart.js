define('shopping_cart/shopping_cart', [
    'address_editor/address_editor',
    'districts/districts',
    'payment/payment',
    'services', 'utils'], function() {
  return angular.module('ShoppingCartModule', [
      'AddressEditorModule', 'DistrictsModule',
      'PaymentModule',
      'ServicesModule', 'UtilsModule'])
    .directive('shoppingCart', function(rpc, utils) {
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

          scope.checkOut = function() {
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
              localPickup: scope.shipTo == scope.PICKUP
            };
            scope.cart.checkOut(user, options).then(function(placed) {
              if (placed) scope.confirming = false;
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
        },
        templateUrl : 'js/shopping_cart/shopping_cart.html?tag=201809242258'
      };
    });
});
