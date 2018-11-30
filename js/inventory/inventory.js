define('inventory/inventory', [
    'model/cart',
    'book_editor/book_editor',
    'orders/orders',
    'shopping_cart/shopping_cart',
    'services', 'utils'], function(Cart) {
  return angular.module('InventoryModule', [
        'BookEditorModule',
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
          scope.cart = new Cart({rpc: rpc, utils: utils});
          scope.selected = {};

          function convertNumbers() {
            utils.forEach(scope.items, function(book) {
              book.category = parseInt(book.category);
              book.price = parseFloat(book.price);
              book.shipping = parseFloat(book.shipping);
              book.int_shipping = parseFloat(book.int_shipping);
            });
            return scope.items;
          }  

          function getItems() {
            return rpc.get_items(null, 99).then(function(response) {
              scope.items = utils.toList(utils.where(response.data, (item) => {
            	    if (parseInt(item.deleted)) return false;
            	    item.stock = parseInt(item.stock);
            	    return true;
                }));
              
              return convertNumbers();
            });
          }

          function getCategories() {
            return rpc.get_item_categories(99).then(function(response) {
              return scope.categories = response.data;
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
          utils.requestOneByOne([getCategories, getItems]);
        },
        templateUrl : 'js/inventory/inventory.html?tag=201809232246'
      };
    });
});
