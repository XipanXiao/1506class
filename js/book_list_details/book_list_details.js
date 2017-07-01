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
          if (classInfo) {
            reload(classInfo);
          }
        });
        
        function reload() {
          utils.requestOneByOne([getDepartments, getCategories, getBookList,
              getDepartmentBooks]);
        };
        
        scope.convertToBookList = function() {
          scope.classInfo.editing = true;
          scope.dirty = true;
        };
        
        scope.removeItem = function(id) {
          var index = scope.classInfo.bookIds.indexOf(id);
          scope.classInfo.bookIds.splice(index, 1);
          scope.dirty = true;
        };

        scope.save = function() {
          var classInfo = scope.classInfo;
          if (!classInfo.term) {
            alert('请指定订书学期.');
            return;
          }

          var data = {
            department_id: classInfo.department_id,
            term: scope.classInfo.term,
            books: utils.map(classInfo.books, function(book) {return book.id;})
          };
          rpc.update_book_list(classInfo).then(function(response) {
            if (response.data.updated) {
              backup();
            }
          });
        };
        scope.remove = function() {
          var term = scope.classInfo.term;
          var depId = scope.classInfo.department_id;
          rpc.remove_book_list(depId, term).then(function(response) {
            if (response.data.deleted) {
              reload();
            }
          });
        };
        scope.restore = function() {
          scope.classInfo = angular.copy(scope.savedInfo);
          scope.dirty = false;
        };
        scope.toggleBook = function(item) {
          var books = scope.classInfo.books;
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
          var dep = scope.departments[scope.classInfo.department_id];
          return rpc.get_items(null, parseInt(dep.level)).then(function(response) {
            if (utils.isEmpty(scope.classInfo.bookIds)) {
              scope.classInfo.bookIds = utils.keys(response.data);
            }
            return scope.items = response.data;
          });
        }
        function getBookList() {
          var term = scope.classInfo.term;
          var depId = scope.classInfo.department_id;
          return rpc.get_book_list(depId, term).then(function(response) {
            scope.classInfo.editing = !utils.isEmpty(response.data);
            scope.classInfo.bookIds = response.data;
            backup();
            return true;
          });
        }
        function backup() {
          scope.savedInfo = angular.copy(scope.classInfo);
          scope.dirty = false;
        }
      },
      templateUrl : 'js/book_list_details/book_list_details.html?tag=201706062300'
    };
  });
});
