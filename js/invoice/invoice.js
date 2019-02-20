define('invoice/invoice',
    ['address_editor/address_editor', 'districts/districts',
  'services', 'utils'], function() {
  return angular.module('InvoiceModule',[
      'AddressEditorModule',
      'DistrictsModule',
      'ServicesModule',
      'UtilsModule'
  ]).directive('invoice', function(rpc, utils) {
    return {
      scope: {
        order: '='
      },
      link: function(scope) {
        function reloadDistrict(order) {
          if (!order) return;
          utils.getDistrictAddress(rpc, order.district).then(function(addr) {
            scope.user = addr;
          });
      } 
        scope.$watch('order', reloadDistrict);
        reloadDistrict(scope.order);
      },
      templateUrl : 'js/invoice/invoice.html?tag=201909231104'
    };
  });
});
