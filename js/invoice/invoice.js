define('invoice/invoice', ['address_editor/address_editor'], function() {
  return angular.module('InvoiceModule', ['AddressEditorModule'])
    .directive('invoice', function() {
      function toMoney(num) {
        return parseFloat(num).toFixed(2);
      }
      return {
        scope: {
          order: '='
        },
        templateUrl : 'js/invoice/invoice.html'
      };
    });
});
