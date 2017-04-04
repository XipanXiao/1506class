define('order_app', [
    'app_bar/app_bar',
    'item_list/item_list',
    'shopping_cart/shopping_cart',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'ItemListModule',
      'ShoppingCartModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function(scope) {
            scope.pageLoaded = [];
            
            scope.cart = {
              items: [],
              add: function(item) {
                item.count = 1;
                this.items.push(item);
                scope.selectTab(1);
              }
            };

            rpc.get_user().then(function(user) {
              perm.user = user;
              scope.user = user;
            });

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                scope.$apply();
              }, 0);
            });
            
            scope.selectTab = function(index) {
              tabs.selected = index;
            };
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_app']);
