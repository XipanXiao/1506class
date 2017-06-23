define('item_list/item_list', ['flying/flying', 'services', 'utils'], function() {
  return angular.module('ItemListModule', ['FlyingModule', 'ServicesModule',
        'UtilsModule'])
    .directive('itemList', function(rpc, utils) {
      return {
        scope: {
          cart: '='
        },
        link: function(scope) {
          scope.items = [];
          rpc.get_item_categories().then(function(response) {
            scope.categories = response.data;
            if (utils.isEmpty(scope.categories)) return;
            utils.forEach(scope.categories, function(category) {
              if (!category.shared) category.selected = true;
            });

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
        templateUrl : 'js/item_list/item_list.html?tag=201706062300'
      };
    });
});
