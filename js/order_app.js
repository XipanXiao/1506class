define('order_app', [
    'model/cart',
    'app_bar/app_bar',
    'item_list/item_list',
    'shopping_cart/shopping_cart',
    'orders/orders',
    'services',
    'permission',
    'utils'],
    function(Cart) {

  angular.module('AppModule', [
      'AppBarModule',
      'ItemListModule',
      'ShoppingCartModule',
      'OrdersModule',
      'PaperBindingsModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function(scope) {
            scope.pageLoaded = [];

            scope.cart = new Cart({rpc: rpc, utils: utils, scope: scope});

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
