define('shopping_cart/shopping_cart', [
    'address_editor/address_editor',
    'districts/districts',
    'services', 'utils'], function() {
  return angular.module('ShoppingCartModule', [
      'AddressEditorModule', 'DistrictsModule', 'ServicesModule', 'UtilsModule'])
    .directive('shoppingCart', function(rpc, utils) {
      return {
        scope: {
          cart: '=',
          user: '='
        },
        link: function(scope) {
          scope.confirming = false;
          scope.addrEditor = {};

          scope.checkOut = function() {
            if (!scope.confirming) {
              scope.confirming = true;
              return;
            }
            var user = scope.user;
            if (scope.sendtoLocalGroup) {
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
            scope.cart.checkOut().then(function(placed) {
              if (placed) scope.confirming = false;
            });
          };

          scope.useLocalGroup = function(local) {
            scope.sendtoLocalGroup = local;
            if (local == 2) {
              scope.user.district = 99;
              scope.cart.shipping = 0.00;
            } else if (!local) {
              scope.user.district = null;
              scope.cart.update();
            }
          };
        },
        templateUrl : 'js/shopping_cart/shopping_cart.html?tag=201809182258'
      };
    });
});
