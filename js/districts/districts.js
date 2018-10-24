define('districts/districts',
    ['services', 'utils'], function() {
  return angular.module('DistrictsModule', ['ServicesModule',
      'UtilsModule']).directive('districts',
          function(rpc, utils) {
    return {
      scope: {
        editable: '=',
        onChange: '&',
        stock: '@',
        user: '='
      },
      link: function(scope) {
        rpc.get_districts().then(function(response) {
          scope.localGroups = response.data;
          scope.localGroupIds = utils.keys(utils.where(scope.localGroups,
              (district) => scope.stock ? parseInt(district.stock) : true));
        });
      },

      templateUrl : 'js/districts/districts.html?tag=201809101350'
    };
  });
});
