define('book_list_details/book_list_details', 
    ['services', 'utils'], function() {
  return angular.module('BookListDetailsModule', [
      'ServicesModule',
      'UtilsModule']).directive('bookListDetails', function(rpc, utils) {
    return {
      scope: {
        classInfo: '='
      },
      link: function(scope) {
        scope.$watch('classInfo', function(classInfo) {
          if (!classInfo) return;

          var bookList = scope.bookList = classInfo;
          scope.savedList = angular.copy(bookList);
          bookList.editing = parseInt(bookList.id) > 0;
          utils.requestOneByOne([getDepartments, getCategories, 
              getDepartmentBooks]);
        });
        
        scope.isDirty = function() {
          return !angular.equals(scope.bookList, scope.savedList);
        };
        scope.remove = function(book) {
          delete scope.bookList.books[book.id];
        };
        scope.save = function() {
          if (!scope.classInfo.term) {
            alert('请在左边班级列表中指定本班订书学期');
            return;
          }

          var bookList = scope.bookList;
          var data = {
            department_id: bookList.department_id,
            term: scope.classInfo.term,
            books: utils.map(bookList.books, function(book) {return book.id;})
          };
          rpc.update_book_list(scope.bookList).then(function(response) {
            if (!response.data.updated) {
              alert('保存失败，请检查该学期书单是否已经存在，请勿重复输入。');
            }
          });
        };
        scope.cancel = function() {
          scope.bookList = angular.copy(scope.savedList);
        };
        scope.toggleBook = function(item) {
          var books = scope.bookList.books;
          if (books[item.id]) {
            delete books[item.id];
          } else {
            books[item.id] = item;
          }
        };

        function getDepartments() {
          return rpc.get_departments().then(function(response) {
            return scope.departments = response.data;
          });
        }
        function getCategories() {
          return rpc.get_item_categories(99).then(function(response) {
            return scope.categories = response.data;
          });
        }
        function getDepartmentBooks() {
          var dep = scope.departments[scope.bookList.department_id];
          return rpc.get_items(null, parseInt(dep.level)).then(function(response) {
            if (!scope.bookList.books) {
              scope.bookList.books = angular.copy(response.data);
            }
            return scope.items = response.data;
          });
        }
      },
      templateUrl : 'js/book_list_details/book_list_details.html?tag=201706062300'
    };
  });
});
