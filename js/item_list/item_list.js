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
          
          var bookIds = {};

          var parent_id = parseInt(utils.getUrlParameter('parent_id')) || 1;

          function validCategory(category) {
            return category && parseInt(category.parent_id) == parent_id;
          }
          
          function validItem(item) {
            return parent_id == 1 ? bookIds.has(item.id) : 
                validCategory(scope.categories[item.category]);
          }
          
          function getCategories() {
            return rpc.get_item_categories().then(function(response) {
              utils.forEach(response.data, function(category) {
                category.selected = true;
              });
              return scope.categories =
                  utils.where(response.data, validCategory);
            });
          }
          
          function getItems() {
            return rpc.get_items().then(function(response) {
              return scope.items =
                  utils.toList(utils.where(response.data, validItem));
            });
          }
          
          function getBookList() {
            if (parent_id != 1) {
              return utils.truePromise();
            }
            return rpc.get_book_list().then(function(response) {
              return bookIds = new Set(response.data);
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
        templateUrl : 'js/item_list/item_list.html?tag=201807050736'
      };
    });
});
