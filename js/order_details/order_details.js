define('order_details/order_details', [
    'address_editor/address_editor', 'permission'], function() {
  return angular.module('OrderDetailsModule', [
      'AddressEditorModule', 'PermissionModule'])
    .directive('orderDetails', function(perm) {
      return {
        scope: {
          admin: '@',
          onCancel: '&',
          onMerge: '&',
          onUpdate: '&',
          order: '='
        },
        link: function(scope) {
          scope.statusLabels = {0: '待发货', 1: '已发货', 3: '钱货两清'};
        },
        templateUrl : 'js/order_details/order_details.html?tag=201705312038'
      };
    });
});
