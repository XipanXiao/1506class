define('item_list/item_list', ['services'], function() {
	return angular.module('ItemListModule', ['ServicesModule'])
		.directive('itemList', function(rpc) {
			return {
			  link: function(scope) {
			    rpc.get_items().then(function(response) {
			      scope.items = response.data;
			    });
		    },
				templateUrl : 'js/item_list/item_list.html'
			};
		});
});
