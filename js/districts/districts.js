define('districts/districts',
    ['services', 'utils'], function() {
  return angular.module('DistrictsModule', ['ServicesModule',
      'UtilsModule']).directive('districts',
          function(rpc, utils) {
    return {
      scope: {
        editable: '@',
        user: '='
      },
      link: function(scope) {
        rpc.get_districts().then(function(response) {
          scope.localGroups = response.data;
          scope.localGroupIds = utils.keys(scope.localGroups);
        });
      },

      templateUrl : 'js/districts/districts.html?tag=201807101350'
    };
  });
});
