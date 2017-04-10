define('shopping_cart/shopping_cart', [
    'address_editor/address_editor',
    'services'], function() {
  return angular.module('ShoppingCartModule', [
      'AddressEditorModule', 'ServicesModule'])
    .directive('shoppingCart', function(rpc) {
      return {
        scope: {
          editingAddress: '=',
          cart: '=',
          user: '='
        },
        link: function(scope) {
          scope.confirming = false;
          
          scope.checkOut = function() {
            if (scope.confirming) {
              scope.cart.checkOut();
            }
            scope.confirming = !scope.confirming;
          };
        },
        templateUrl : 'js/shopping_cart/shopping_cart.html'
      };
    });
});
