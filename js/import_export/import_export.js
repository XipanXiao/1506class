define(['services', 'importers'], function() {
  return angular.module('ImportExportModule', ['ServicesModule',
      'ImportersModule']).directive('importExport', function(rpc, importers) {
        return {
          scope: {
            file: '='
          },
          link: function($scope, element, attributes) {
            $scope.result = {
              users: [],
              skipped: []
            };

            $scope.preview = function() {
              var reader = new FileReader();

              reader.onload = function(event) {
                var text = event.target.result;
                var importer = attributes.importer + 'Importer';

                rpc.get_classes().then(function(response) {
                  var classes = response.data;
                  $scope.result = importers[importer](text, {classes: classes});
                });
              };

              reader.readAsText($scope.file, "UTF-8");
            };
          },
          templateUrl : 'js/import_export/import_export.html'
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
