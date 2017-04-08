define('order_details/order_details', [
    'address_editor/address_editor'], function() {
  return angular.module('OrderDetailsModule', [
      'AddressEditorModule'])
    .directive('orderDetails', function() {
      return {
        scope: {
          onCancel: '&',
          order: '=',
        },
        templateUrl : 'js/order_details/order_details.html'
      };
    });
});
