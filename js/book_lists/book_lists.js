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
          var lists = scope.booklists[scope.currentDep.id] || {};
          scope.booklists[scope.currentDep.id] = lists;
          var maxId = 0;
          var term = 0;
          for (var id in lists) {
            if (parseInt(id) > maxId) {
              maxId = parseInt(id);
            }
            if (lists[id].term > term) {
              term = lists[id].term;
            }
          }
          lists[maxId + 1] = scope.selected = {
            department_id: scope.currentDep.id,
            term: term + 1,
            books: {}
          }; 
        };
        scope.updateClassTerm = function(classInfo) {
          rpc.update_class_term(classInfo);
        };
        scope.selectClass = function(classInfo) {
          scope.selectedClass = classInfo;
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
