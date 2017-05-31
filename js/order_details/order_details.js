define('order_details/order_details', [
    'address_editor/address_editor', 'permission'], function() {
  return angular.module('OrderDetailsModule', [
      'AddressEditorModule', 'PermissionModule'])
    .directive('orderDetails', function(perm) {
      return {
        scope: {
          editable: '=',
          onCancel: '&',
          onMerge: '&',
          onUpdate: '&',
          order: '=',
          user: '='
        },
        link: function(scope) {
          scope.statusLabels = {0: '待发货', 1: '已发货', 3: '钱货两清'};
          scope.isMyOrder = function() {
            return scope.order.user_id == scope.user.id;
          };
          scope.isOrderAdmin = function() {
            return perm.isOrderAdmin();
          };
        },
        templateUrl : 'js/order_details/order_details.html?tag=201705302226'
      };
    });
});
