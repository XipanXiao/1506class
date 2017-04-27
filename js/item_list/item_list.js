define('item_list/item_list', ['services'], function() {
  return angular.module('ItemListModule', ['ServicesModule'])
    .directive('itemList', function(rpc) {
      return {
        scope: {
          cart: '='
        },
        link: function(scope) {
          scope.items = [];
          rpc.get_item_categories().then(function(response) {
            scope.categories = response.data;
            scope.categories[1].selected = true;

            rpc.get_items().then(function(response) {
              for (var id in response.data) {
                scope.items[id] = response.data[id];
              }
            });
          });
          scope.addToCart = function(item) {
            scope.cart.add(item);
          };
        },
        templateUrl : 'js/item_list/item_list.html'
      };
    });
});
