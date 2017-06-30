define('book_list_details/book_list_details', 
    ['services', 'utils'], function() {
  return angular.module('BookListDetailsModule', [
      'ServicesModule',
      'UtilsModule']).directive('bookListDetails', function(rpc, utils) {
    return {
      scope: {
        bookList: '='
      },
      link: function(scope) {
        scope.$watch('bookList', function(bookList) {
          if (bookList) {
            scope.savedList = angular.copy(bookList);
          }
        });
        rpc.get_departments().then(function(response) {
          scope.departments = response.data;
        });
        scope.isDirty = function() {
          return !angular.equals(scope.bookList, scope.savedList);
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
          rpc.update_book_list(scope.bookList).then(function(response) {
            if (!response.data.updated) {
              alert('保存失败，请检查该学期书单是否已经存在，请勿重复输入。');
            }
          });
        };
        scope.cancel = function() {
          scope.bookList = angular.copy(scope.savedList);
        };
      },
      templateUrl : 'js/book_list_details/book_list_details.html?tag=201706062300'
    };
  });
});
