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
                scope.editor.value = scope.value;
					    };
					    scope.cancel = function() {
					      scope.editing = false;
                scope.editor.value = scope.value;
					    };
					    scope.keyPressed = function(event) {
					      if (event.keyCode == 13) {
					        scope.commit();
					        //event.stopPropagation();
					        event.preventDefault();
					      } else if (event.keyCode == 27) {
					        scope.cancel();
                  //event.stopPropagation();
					        event.preventDefault();
					      }
					    };
					  },
						templateUrl : 'js/editable_label/editable_label.html'
					};
				});
});
