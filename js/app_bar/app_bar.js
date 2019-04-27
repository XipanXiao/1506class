define('app_bar/app_bar', ['permission', 'search_bar/search_bar', 'utils'],
    function() {
  return angular.module('AppBarModule', ['PermissionModule',
     'SearchBarModule', 'UtilsModule'])
    .directive('appBar', function(perm, utils) {
      return {
        scope: {
          admining: '@',
          user: '='
        },
        link: function(scope) {
          scope.weekDayLabels = utils.weekDayLabels;
          scope.formatTime = utils.formatTime;
          scope.isAdmin = function() {
            return perm.isAdmin();
          };
          scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          scope.isDistrictInspector = () => perm.isDistrictInspector();
          scope.isYearLeader = function() {
            return perm.isYearLeader();
          };
          scope.isOrderAdmin = function() {
            return perm.isOrderAdmin();
          };
          scope.isTeacher = function() {
            return perm.isTeacher();
          };
          scope.canReadOrders = function() {
            return perm.canReadOrders();
          };
          scope.showAssignments = function() {
            return perm.isSysAdmin() || perm.isYearLeader();
          };
          scope.isIn = function(page) {
            return location.pathname.endsWith(page);
          };
        },
        templateUrl : 'js/app_bar/app_bar.html?tag=201904062357'
      };
    });
});
