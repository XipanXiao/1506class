define('invoice/invoice',
    ['address_editor/address_editor', 'districts/districts'], function() {
  return angular.module('InvoiceModule',[
      'AddressEditorModule',
      'DistrictsModule'
  ]).directive('invoice', function() {
    return {
      scope: {
        order: '='
      },
      templateUrl : 'js/invoice/invoice.html?tag=201809231104'
    };
  });
});
