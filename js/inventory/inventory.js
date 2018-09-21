define('inventory/inventory', [
    'model/cart',
    'orders/orders',
    'shopping_cart/shopping_cart',
    'services', 'utils'], function(Cart) {
  return angular.module('InventoryModule', [
        'OrdersModule',
        'ShoppingCartModule',
        'ServicesModule',
        'UtilsModule'])
    .directive('inventory', function($rootScope, rpc, utils) {
      return {
        scope: {
          user: '='
        },
        link: function(scope) {
          scope.year = new Date().getFullYear();
          scope.cart = new Cart({rpc: rpc, utils: utils,
              rootScope: $rootScope});
          scope.selected = {};

          function getItems() {
            return rpc.get_items(null, 99).then(function(response) {
              return scope.items = utils.toList(
                  utils.where(response.data, 
                      (item) => !parseInt(item.deleted)));
            });
          }

          scope.addToCart = (item) => scope.cart.add(item);
          
          scope.remove = (item) => {
        	    if (parseInt(item.stock)) {
        	    	  alert('库存非0，不能删除。');
        	    	  return;
        	    }
        	    if (!confirm('请确认删除"{0}"'.format(item.name))) return;

        	    rpc.update_item({id: item.id, deleted: 1}).then((response) => {
        	    	  if (response.data.updated) {
        	    		var index = scope.items.indexOf(item);
        	    		scope.items.splice(index, 1);
        	    	  }
        	    });
          };
          
          $rootScope.$on('reload-orders', getItems);
          $rootScope.$on('order-deleted', getItems);
          getItems();
        },
        templateUrl : 'js/inventory/inventory.html?tag=201812232246'
      };
    });
});
