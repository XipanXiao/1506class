define('admin_app',
    ['app_bar/app_bar', 'classes/classes', 'class_info/class_info',
    	'email_dialog/email_dialog',
    'task_stats/task_stats', 'learning_records/learning_records',
    'scores/scores',
    'schedule_editor/schedule_editor', 'services', 'permission', 'utils',
    'zb_login_dialog/zb_login_dialog',
    'zb_choose_root_dialog/zb_choose_root_dialog'],
    function() {

  angular.module('AppModule', ['AppBarModule',
      'ChooseClassTermDialogModule',
      'ClassesModule',
      'ClassInfoModule',
      'ConfirmGraduateDialogModule',
      'EmailDialogModule',
      'TaskStatsModule',
      'LearningRecordsModule',
      'PaperBindingsModule',
      'PermissionModule',
      'ScoresModule',
      'ScheduleEditorModule',
      'ServicesModule',
      'UtilsModule',
      'ZBLoginDialogModule',
      'ZBChooseRootDialogModule'])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            $scope.pageLoaded = [true];
            var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (isFirefox) {
              $scope.pageLoaded = [true, true, true, true, true, true, true];
            }

            rpc.get_user().then(function(user) {
              perm.user = user;
              $scope.user = user;
              $scope.classId = user.classId;
            });
            
            var tabs = document.querySelectorAll('paper-tabs paper-tab');

            function selectPage(index) {
              var tabControl = document.querySelector('paper-tabs');
              tabControl.select(index);
              var bar = tabControl.querySelector('#selectionBar');
              if (bar) {
                var percent = index * 100 / tabs.length;
                var scaleX = 1 / tabs.length;
                bar.style.transform = 'translate3d({0}%, 0px, 0px) scaleX({1})'.
                    format(percent, scaleX);
              }
              var pages = document.querySelectorAll('#main-page-container > *');
              for (var i = 0; i < pages.length; i++) {
                pages[i].style.display = index == i ? '' : 'none';
              }
              return index;
            }

            function addTabClickHandler(index) {
              var tab = tabs[index];
              tab.addEventListener('click', function() {
                $scope.pageLoaded[selectPage(index)] = true;
                setTimeout(function() {
                  $scope.$apply();
                }, 0);
              });
            }
            for (var index = 0; index < tabs.length; index++) {
              addTabClickHandler(index);
            }
            
            $scope.$on('editing-user-changed', function(event, editingUser) {
              if (!editingUser) return;
              selectPage(0);
            });

            $scope.$on('select-page', function(event, index) {
              selectPage(index);
            });

            window.emailjs && emailjs.init("user_ZAqyLkjaj5MHdbn3alvEx");
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['admin_app']);
