define('app_bar/app_bar', ['permission', 'search_bar/search_bar', 'utils'],
    function() {
  return angular.module('AppBarModule', ['PermissionModule',
     'SearchBarModule', 'UtilsModule', 'ServicesModule'])
    .directive('appBar', function(perm, utils, rpc) {
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
          scope.isCountryInspector = () => perm.isCountryInspector();
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
          scope.selectedClassId = null;
          scope.changeClass = function() {
            if (!scope.selectedClassId) return;
            utils.redirect('php/su.php?class_id={0}'.format(scope.selectedClassId));
          };
          rpc.get_user_classes().then(function(response) {
            scope.classes = response.data;
            scope.selectedClassId = (scope.user || perm.user).classInfo.id;
          });
        },
        templateUrl : 'js/app_bar/app_bar.html?tag=202512122357'
      };
    });
});
