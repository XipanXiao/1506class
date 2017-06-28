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
      },
      templateUrl : 'js/book_lists/book_lists.html?tag=201706062300'
    };
  });
});
