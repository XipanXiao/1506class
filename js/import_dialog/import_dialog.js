define(['importers'], function() {
  return angular.module('ImportDialogModule', ['ImportersModule'])
      .directive('importDialog', function(importers) {
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

            var importer = attributes.importer + 'Importer';

            $scope.analyze = function() {
              var reader = new FileReader();

              reader.onload = function(event) {
                var text = event.target.result;

                importers[importer].analyze(text).then(function(result) {
                  $scope.result = result;  
                  $scope.openDialog('analysis');
                });
              };

              reader.readAsText($scope.file, 'UTF-8');
            };
            
            $scope.preview = function() {
              $scope.processed = 0;
              importers[importer].diff($scope.result.records, $scope.progress); 
              $scope.openDialog('preview');
            };
            
            $scope.submit = function() {
              $scope.errors = [];
              $scope.processed = 0;
              importers[importer].submit($scope.result.records,
                  $scope.progress, function(record, message) {
                $scope.errors.push('failed to update ' + record.email + ':'
                    + message);
              });
            };
            
            $scope.progress = function(value) {
              $scope.processed = value;
            };
            
            $scope.diffType = function(record, key) {
              if (!record.oldData) return 'diff-added';
              return (!record[key] && !record.oldData[key] || 
                  record[key] == record.oldData[key]) ?
                  'diff-identical' : 'diff-modified';
            };

            $scope.$watch('show', function() {
              if (!$scope.show) return;
              $scope.openDialog('selector');
              setTimeout(function() {
                $scope.show = false;
                $scope.$apply();
              }, 0);
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
