define('item_list/item_list', ['flying/flying', 'services', 'utils'], function() {
  return angular.module('ItemListModule', ['FlyingModule', 'ServicesModule',
        'UtilsModule'])
    .directive('itemList', function(rpc, utils) {
      return {
        scope: {
          cart: '=',
          user: '='
        },
        link: function(scope) {
          scope.items = [];
          
          function getCategories() {
            return rpc.get_item_categories().then(function(response) {
              utils.forEach(response.data, function(category) {
                category.selected = 
                    !utils.isEmpty(scope.bookIds) || !category.shared;
              });
              return scope.categories = response.data;
            });
          }
          
          function getItems() {
            return rpc.get_items().then(function(response) {
              var ids = utils.isEmpty(scope.bookIds) 
                  ? utils.keys(response.data)
                  : scope.bookIds;

              ids.forEach(function(id) {
                scope.items[id] = response.data[id];
              });
              return scope.items;
            });
          }
          
          function getBookList() {
            return rpc.get_book_list().then(function(response) {
              return scope.bookIds = response.data;
            });
          }

          scope.addToCart = function(item) {
            scope.cart.add(item);
          };
          
          scope.$watch('user', function(user) {
            if (user) {
              utils.requestOneByOne([getBookList, getCategories, getItems]);
            }
          });
        },
        templateUrl : 'js/item_list/item_list.html?tag=201706062300'
      };
    });
});
