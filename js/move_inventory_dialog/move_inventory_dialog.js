angular.module('MoveInventoryDialogModule', [
    'DistrictsModule',
    'PaperBindingsModule',
    'ServicesModule',
    'UtilsModule',
  ]).directive('moveInventoryDialog', function (rpc, utils) {
    return {
      scope: {
        district: '=',
        deferred: '=',
        item: '='
      },
      link: function (scope) {
        scope.sourceDistrict = scope;
        scope.targetDistrict = {district: null};
        scope.move = function() {
          var from = scope.district;
          var to = scope.targetDistrict.district;
          var item = {item_id: scope.item.id, count: scope.item.count};
          rpc.move_inventory(item, from, to).then(function(response) {
            if (parseInt(response.data.updated)) {
              scope.deferred.resolve();
            }
          });
        };
      },
      templateUrl: 'js/move_inventory_dialog/move_inventory_dialog.html?tag=20180621'
    };
  });
  