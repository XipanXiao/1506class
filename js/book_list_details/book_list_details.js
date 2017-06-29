define('book_list_details/book_list_details', 
    ['departments/departments', 'services', 'utils'], function() {
  return angular.module('BookListDetailsModule', [
      'DepartmentsModule',
      'ServicesModule',
      'UtilsModule']).directive('bookListDetails', function(rpc, utils) {
    return {
      scope: {
        bookList: '='
      },
      link: function(scope) {
        scope.$watch('bookList', function(bookList) {
          if (!bookList) return;
          scope.savedList = angular.copy(bookList);
          rpc.get_departments().then(function(response) {
            bookList.department = response.data[bookList.department_id];
          });
        });
        scope.isDirty = function() {
          return !angular.equals(scope.bookList, scope.savedList);
        };
        scope.getBookListName = function() {
          return utils.getBookListName(scope.bookList);
        };
        scope.add = function() {
          // TODO: Add a book chooser to pick a book.
          var book = {};
          scope.bookList.books.push(book);
        };
        scope.remove = function(book) {
          var index = scope.bookList.books.indexOf(book);
          scope.bookList.books.splice(index, 1);
        };
        scope.save = function() {
          rpc.update_book_list(scope.bookList);
        };
        scope.cancel = function() {
          scope.bookList = angular.copy(scope.savedList);
        };
      },
      templateUrl : 'js/book_list_details/book_list_details.html?tag=201706062300'
    };
  });
});
