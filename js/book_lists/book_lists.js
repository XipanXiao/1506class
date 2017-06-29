define('book_lists/book_lists', 
    ['book_list_details/book_list_details', 
     'services', 
     'utils'], function() {
  return angular.module('BookListsModule', [
      'BookListDetailsModule',
      'ServicesModule',
      'UtilsModule']).directive('bookLists', function(rpc, utils) {
    return {
      link: function(scope) {
        scope.currentClass = {
          year: (new Date()).getFullYear()
        };
        scope.years = [];
        for (var year = 2011;year <= scope.currentClass.year; year++) {
          scope.years.push(year);
        }
        scope.yearChanged = function() {
          rpc.get_class_book_lists(scope.currentClass.year)
              .then(function(response) {
                scope.classes = response.data;
                utils.forEach(scope.classes, function(classInfo) {
                  if (classInfo.book_list_id) {
                    var booklist = scope.booklists[classInfo.book_list_id];
                    classInfo.listName = booklist.name;
                  } else {
                    classInfo.listName = '本系所有法本';
                  }
                });
              });
        };
        rpc.get_book_lists().then(function(response) {
          scope.booklists = response.data;
          scope.booklists.forEach(function(booklist) {
            booklist.name = utils.getBookListName(booklist);
          });
          scope.yearChanged();
        });
        scope.addBookList = function() {
          var id = utils.maxKey(scope.booklists) + 1;
          scope.selected = scope.booklists[id] = {};
        };
      },
      templateUrl : 'js/book_lists/book_lists.html?tag=201706062300'
    };
  });
});
