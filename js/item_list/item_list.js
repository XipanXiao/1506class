define('item_list/item_list', ['services'], function() {
	return angular.module('ItemListModule', ['ServicesModule'])
		.directive('itemList', function(rpc) {
			return {
			  scope: {
			    cart: '='
			  },
			  link: function(scope) {
			    rpc.get_items().then(function(response) {
			      scope.items = response.data;
			    });
			    scope.addToCart = function(item) {
			      scope.cart.add(item);
			    };
		    },
				templateUrl : 'js/item_list/item_list.html'
			};
		});
});
