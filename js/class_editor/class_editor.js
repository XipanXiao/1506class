define(['departments/departments', 'editable_label/editable_label',
    'permission', 'services', 'user_picker/user_picker', 'utils'], function() {

  return angular.module('ClassEditorModule',
      ['DepartmentsModule', 'EditableLabelModule', 'ServicesModule',
       'UserPickerModule', 'UtilsModule']).directive('classEditor',
        function(perm, rpc, utils) {
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
                rpc.update_class(scope.classInfo);
              };
              
              scope.$watch('classId', function(classId) {
                if (!classId) return;
                
                rpc.get_classes(classId).then(function(response) {
                  scope.classInfo = response.data[classId];
                  scope.setupPermissionEditor(scope.classInfo);
                });
              });
              
              scope.years = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019];
              
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
