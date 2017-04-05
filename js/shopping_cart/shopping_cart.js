define('shopping_cart/shopping_cart', ['services'], function() {
	return angular.module('ShoppingCartModule', ['ServicesModule'])
		.directive('shoppingCart', function(rpc) {
			return {
			  scope: {
			    cart: '='
			  },
				templateUrl : 'js/shopping_cart/shopping_cart.html'
			};
		});
});
