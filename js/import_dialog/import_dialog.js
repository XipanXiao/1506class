define(['services', 'importers'], function() {
  return angular.module('ImportDialogModule', ['ServicesModule',
      'ImportersModule']).directive('importDialog', function(rpc, importers) {
        return {
          scope: {
            file: '=',
            show: '='
          },
          link: function($scope, element, attributes) {
            $scope.page = -1;

            $scope.result = {
              records: [],
              skipped: []
            };

            $scope.analyze = function() {
              var reader = new FileReader();

              reader.onload = function(event) {
                var text = event.target.result;
                var importer = attributes.importer + 'Importer';

                rpc.get_classes().then(function(response) {
                  var classes = response.data;
                  $scope.result = importers[importer](text, {classes: classes});
                  $scope.openDialog('analysis');
                });
              };

              reader.readAsText($scope.file, 'UTF-8');
            };
            
            $scope.$watch('show', function() {
              if (!$scope.show) return;
              $scope.openDialog('selector');
            });
            
            $scope.openDialog = function(id) {
              document.querySelector('#' + id).open();
            };
          },
          templateUrl : 'js/import_dialog/import_dialog.html'
        };
      }).directive('file', function() {
        return {
          scope: {
            file: '='
          },
          link: function($scope, element) {
            element.bind('change', function(event){
              $scope.file = event.target.files[0];
              $scope.$apply();
            });
          }
        };
      });
});
