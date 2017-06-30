define('book_lists/book_lists', 
    ['book_list_details/book_list_details',
     'editable_label/editable_label',
     'services', 
     'utils'], function() {
  return angular.module('BookListsModule', [
      'BookListDetailsModule',
      'EditableLabelModule',
      'ServicesModule',
      'UtilsModule']).directive('bookLists', function(rpc, utils) {
    return {
      link: function(scope) {
        scope.currentDep = {id: 1};
        scope.currentClass = {
          year: (new Date()).getFullYear()
        };
        scope.years = [];
        for (var year = 2011;year <= scope.currentClass.year; year++) {
          scope.years.push(year);
        }
        scope.yearChanged = function() {
          return rpc.get_class_book_lists(scope.currentClass.year)
              .then(function(response) {
                return scope.classes = response.data;
              });
        };
        scope.addBookList = function() {
          var id = utils.maxKey(scope.booklists) + 1;
          scope.selected = scope.booklists[id] = {
            department_id: scope.currentDep.id,
            term: 1
          };
        };
        scope.updateClassTerm = function(classInfo) {
          rpc.update_class_term(classInfo);
        };
        function getDepartments() {
          return rpc.get_departments().then(function(response) {
            scope.depIds = utils.keys(response.data);
            return scope.departments = response.data;
          });
        }
        function getBookLists() {
          return rpc.get_book_lists().then(function(response) {
            return scope.booklists = 
                utils.groupBy(response.data, 'department_id');
          });
        }
        utils.requestOneByOne([getDepartments, getBookLists,
            scope.yearChanged]);
      },
      templateUrl : 'js/book_lists/book_lists.html?tag=201706062300'
    };
  });
});
