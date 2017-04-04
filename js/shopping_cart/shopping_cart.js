define('shopping_cart/shopping_cart', ['services'], function() {
	return angular.module('ShoppingCartModule', ['ServicesModule'])
		.directive('shoppingCart', function(rpc) {
			return {
			  scope: {
			    cart: '='
			  },
			  link: function(scope) {
			    scope.remove = function(item) {
			      var items = scope.cart.items;
			      var index = items.indexOf(item);
			      if (item < 0) return;
			      items.splice(index, 1);
			    };
			    scope.$watch('cart.items', function(items) {
			      scope.subTotal = 0;
			      if (!items) return;
			      var add = function(sum, item) {
			        return sum + parseFloat(item.price);
			      }; 
			      scope.subTotal = items.reduce(add, 0);
			    });
		    },
				templateUrl : 'js/shopping_cart/shopping_cart.html'
			};
		});
});
