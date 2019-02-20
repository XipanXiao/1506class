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
        scope.$watch('district', function(district) {
          if (!district) return;
          utils.getDistrictAddress(rpc, district).then(function(addr) {
            scope.user = addr;
            scope.user.district = district;
          });
        });
        scope.save = function() {
          var districtInfo = {
            id: scope.district,
            paypal_client_id: scope.user.paypal_client_id
          };
          utils.addressFields.forEach(function(field) {
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
