define('order_admin_app', [
    'app_bar/app_bar',
    'book_lists/book_lists',
    'district_edit_dialog/district_edit_dialog',
    'orders/orders',
    'order_stats/order_stats',
    'inventory/inventory',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'BookListsModule',
      'DistrictEditDialogModule',
      'MoveInventoryDialogModule',
      'OrdersModule',
      'OrderStatsModule',
      'InventoryModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function($rootScope, rpc, perm, utils) {
        return {
          link: function(scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              scope.user = user;
              if (!perm.canReadOrders()) {
                utils.redirect('./index.html');
              }
            });
            
            scope.isOrderAdmin = function() {
              return perm.isOrderAdmin();
            };

            scope.year = new Date().getFullYear();
            scope.pageLoaded = [];
            var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (isFirefox) {
              $scope.pageLoaded = [true, true, true, true, true, true, true];
            }

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                scope.$apply();
              }, 0);
            });

            emailjs.init("user_ZAqyLkjaj5MHdbn3alvEx");
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_admin_app']);
