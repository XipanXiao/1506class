define('class_editor/class_editor', ['departments/departments',
    'department_editor_dialog/department_editor_dialog', 
    'editable_label/editable_label',
    'permission', 'services', 'user_picker/user_picker', 'utils'], function() {

  return angular.module('ClassEditorModule',
      ['DepartmentEditorDialogModule',
       'DepartmentsModule', 'EditableLabelModule', 'ServicesModule',
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
              
              scope.save = function() {
                rpc.update_class(scope.classInfo).then(function(response) {
                  if (response.data.updated) {
                    var id = scope.classInfo.id || response.data.updated;
                    $rootScope.$broadcast('class-updated', id);
                    scope.reload(id);
                  } else {
                    scope.error = response.data.error;
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
                scope.reload(classId);
              });
              
              scope.years = [''];
              for (var index = 1; index < 25; index++) {
                scope.years[index] = 2011 + index;
              }
              
              scope.teachers = {};
              rpc.get_admins(perm.ROLES.TEACHER).then(function(response) {
                for (var id in response.data) {
                  scope.teachers[id] = response.data[id].name;
                };
              });
              
              scope.reload = function(classId) {
                if (classId == 0) {
                  scope.classInfo = utils.classTemplate();
                  scope.oldInfo = angular.copy(scope.classInfo);
                  scope.setupPermissionEditor(scope.classInfo);
                } else if (classId) {
                  rpc.get_classes(classId).then(function(response) {
                    scope.classInfo = response.data[classId];
                    scope.oldInfo = angular.copy(scope.classInfo);
                    scope.setupPermissionEditor(scope.classInfo);
                  });
                }
              };
              
              scope.cancel = function() {
                scope.reload(scope.classId);
              };
              
              scope.isDirty = function() {
                return !angular.equals(scope.classInfo, scope.oldInfo);
              };
              
              scope.openDepartmentEditor = function() {
                document.querySelector('#department-editor-dlg').open();
              };
            },
            templateUrl : 'js/class_editor/class_editor.html'
          };
        });
});
