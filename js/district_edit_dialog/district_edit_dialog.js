define('district_edit_dialog/district_edit_dialog', 
    ['address_editor/address_editor',
    'districts/districts', 
    	'permission', 'services', 'utils'], function() {
  return angular.module('DistrictEditDialogModule', [
      'AddressEditorModule', 
      'DistrictsModule',
      'PermissionModule', 'ServicesModule', 'UtilsModule'])
      .directive('districtEditDialog', function(perm, rpc, utils) {
    return {
      scope: {
    	  district: '='
      },
      link: function(scope) {
        var addr_fields = utils.addressFields;
        scope.$watch('district', function(district) {
          if (!district) return;

          rpc.get_districts().then(function(response) {
            var districtInfo = response.data[district];
            scope.user = {
              district: district,
            };
            addr_fields.forEach(function(field) {
              scope.user[field] = districtInfo['cfo_' + field];
            });
            scope.user.paypal_client_id = districtInfo.paypal_client_id;
          });
        });
        scope.save = function() {
          var districtInfo = {
            id: scope.district,
            paypal_client_id: scope.user.paypal_client_id
          };
          addr_fields.forEach(function(field) {
            districtInfo['cfo_' + field] = scope.user[field];
          });
        rpc.update_district(districtInfo).then(function(response) {
          if (parseInt(response.data.updated)) {
            var dialog = document.getElementById('district-edit-dialog');
            dialog.close();    
          }
        });
        };
      },
      templateUrl : 'js/district_edit_dialog/district_edit_dialog.html?tag=20180821'
    };
  });
});
