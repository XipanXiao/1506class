define(function() {
	return angular.module('EditableLabelModule', [])
		.directive('editableLabel',
				function() {
					return {
					  scope: {
              onChange: '&',
					    label: '@',
					    value: '='
					  },
					  link: function(scope) {
					    scope.editor = {
					      value: scope.value
					    };
					    scope.commit = function() {
					      scope.editing = false;
					      scope.value = scope.editor.value;
					      if (scope.onChange) {
					        setTimeout(function() {
					          scope.$apply();
	                  scope.onChange();
					        }, 0);
					      }
					    };
					    scope.edit = function() {
					      scope.editing = true;
					    };
					    scope.keyPressed = function(event) {
					      if (event.keyCode == 13) {
					        scope.commit();
					      } else if (event.keyCode == 27) {
					        scope.editing = false;
					      }
					    };
					  },
						templateUrl : 'js/editable_label/editable_label.html'
					};
				});
});
