define('shopping_cart/shopping_cart', [
    'address_editor/address_editor',
    'services'], function() {
  return angular.module('ShoppingCartModule', [
      'AddressEditorModule', 'ServicesModule'])
    .directive('shoppingCart', function(rpc) {
      return {
        scope: {
          cart: '=',
          user: '='
        },
        link: function(scope) {
          scope.confirming = false;
          
          scope.checkOut = function() {
            if (scope.confirming) {
              var response = scope.cart.checkOut();
              if (!response) {
                scope.editingAddress = true;
              } else {
                response.then(function(placed) {
                  if (placed) scope.confirming = false;
                });
              }
            } else {
              scope.confirming = true;
            }
          };
        },
        templateUrl : 'js/shopping_cart/shopping_cart.html'
      };
    });
});
