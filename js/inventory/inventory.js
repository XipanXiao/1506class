define('inventory/inventory', [
    'model/cart',
    'book_editor/book_editor',
    'districts/districts',
    'orders/orders',
    'shopping_cart/shopping_cart',
    'services', 'utils'], function(Cart) {
  return angular.module('InventoryModule', [
        'BookEditorModule',
        'DistrictsModule',
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
          // Load Seattle inventory by default.
          scope.inventory = {district: scope.user.district};

          function convertNumbers() {
            utils.forEach(scope.items, function(book) {
              book.category = parseInt(book.category);
              book.price = parseFloat(book.price) || 0.00;
              book.shipping = parseFloat(book.shipping) || 0.00;
              book.int_shipping = parseFloat(book.int_shipping) || 0.00;
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

          function getInventory() {
            var district = scope.inventory.district;
            return rpc.get_inventory(district).then(function(response) {
              scope.inventory.items = response.data;
              utils.forEach(scope.items, function(item) {
                var inventory = response.data[item.id];
                item.stock = parseInt(inventory && inventory.stock || 0);
              });
              return true;
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
          
          function reload() {
            return utils.requestOneByOne([getItems, getInventory]);  
          };

          scope.reloadInventory = function() {
            reload();
          };

          $rootScope.$on('reload-orders', reload);
          $rootScope.$on('order-deleted', reload);
          $rootScope.$on('order-item-deleted', reload);
          $rootScope.$on('order-updated', reload);

          utils.requestOneByOne([getCategories, reload]);
        },
        templateUrl : 'js/inventory/inventory.html?tag=201901011450'
      };
    });
});
