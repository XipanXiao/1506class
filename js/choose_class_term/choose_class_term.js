angular.module('ChooseClassTermDialogModule', ['ClassesModule']).directive('chooseClassTermDialog',
  function() {
    return {
      scope: {
        deferred: '=',
        selection: '='
      },
      templateUrl : 'js/choose_class_term/choose_class_term.html'
    };
});
