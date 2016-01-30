define(['departments/departments', 'editable_label/editable_label',
    'permission', 'services', 'user_picker/user_picker', 'utils'], function() {

  return angular.module('ClassEditorModule',
      ['DepartmentsModule', 'EditableLabelModule', 'ServicesModule',
       'UserPickerModule', 'UtilsModule']).directive('classEditor',
        function($rootScope, perm, rpc, utils) {
          return {
            scope: {
              classId: '='
            },
            link: function(scope) {
              scope.setupPermissionEditor = function(classInfo) {
                scope.permissionLabel = {};
                for (var permission in perm.permissions) {
                  var label = perm.permissions[permission];
                  scope.permissionLabel[perm.level(permission)] = label; 
                }
                
                scope.permissions = utils.keys(scope.permissionLabel);

                scope.showPermEditor = perm.canWrite(scope.classInfo);
              };
              
              scope.update = function() {
                rpc.update_class(scope.classInfo).then(function(response) {
                  if (response.data.updated && !scope.classInfo.id) {
                    var id = response.data.updated;
                    $rootScope.$broadcast('class-added', id);
                  }
                });
              };
              
              scope.remove = function() {
                var id = scope.classInfo.id;
                rpc.remove_class(id).then(function(response) {
                  if (response.data.deleted) {
                    $rootScope.$broadcast('class-deleted', id);
                  }
                });
              }
              
              scope.$watch('classId', function(classId) {
                if (classId == 0) {
                  scope.classInfo = utils.classTemplate();
                  scope.setupPermissionEditor(scope.classInfo);
                } else if (classId) {
                  rpc.get_classes(classId).then(function(response) {
                    scope.classInfo = response.data[classId];
                    scope.setupPermissionEditor(scope.classInfo);
                  });
                }
              });
              
              scope.years = [];
              for (var index = 0; index < 25; index++) {
                scope.years[index] = 2012 + index;
              }
              
              scope.teachers = {};
              rpc.get_admins(perm.ROLES.TEACHER).then(function(response) {
                for (var id in response.data) {
                  scope.teachers[id] = response.data[id].name;
                };
              });
            },
            templateUrl : 'js/class_editor/class_editor.html'
          };
        });
});
