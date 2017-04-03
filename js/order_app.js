define('order_app', [
    'app_bar/app_bar',
    'item_list/item_list',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'ItemListModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function(scope) {
            scope.pageLoaded = [];
            
            scope.cart = {
              items: {},
              add: function(item) {
                this.items[item.id] = 1;
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
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_app']);
