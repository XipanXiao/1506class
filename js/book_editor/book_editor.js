define('book_editor/book_editor', 
    ['services', 'utils'], function() {
  return angular.module('BookEditorModule', [
      'ServicesModule',
      'UtilsModule']).directive('bookEditor', function(rpc, utils) {
    return {
      scope: {
        book: '=',
        categories: '=',
        items: '=',
        onCancel: '&'
      },
      link: function(scope) {
        scope.$watch('categories', function(categories) {
          if (categories) {
            scope.categoryIds = utils.keys(categories);
          }
        });

        /// Updates or creates a book, adds it to [items] if it's new.
        scope.updateBook = function() {
          rpc.update_item(scope.book).then(function(response) {
            var id = response.data.updated;
            if (id) {
              if (!scope.book.id) {
                scope.book.id = id;
                scope.items[id] = scope.book;
              }
              scope.book = null;
            } else {
              alert('新建法本失败，请检查是不是同名法本已经存在！');
            }
          });
        };
      },
      templateUrl : 'js/book_editor/book_editor.html?tag=201807091052'
    };
  });
});
