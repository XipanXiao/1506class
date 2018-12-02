define('book_list_details/book_list_details', 
    ['book_editor/book_editor', 'services', 'utils'], function() {
  return angular.module('BookListDetailsModule', [
      'BookEditorModule',
      'ServicesModule',
      'UtilsModule']).directive('bookListDetails', function(rpc, utils) {
    return {
      scope: {
        classInfo: '='
      },
      link: function(scope, element) {
        scope.$watch('classInfo', function(classInfo) {
          if (classInfo) {
            reload(classInfo);
          }
        });

        function reload() {
          utils.requestOneByOne([getDepartments, getCategories,
              getDepartmentBooks, getBookList]);
        };

        scope.removeItem = function(id) {
          delete scope.classInfo.books[id];
          scope.dirty = true;
        };

        scope.clear = function() {
          scope.classInfo.books = {};
          scope.classInfo.adding = true;
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
            bookIds: utils.keys(classInfo.books)
          };
          rpc.update_book_list(data).then(function(response) {
            if (response.data.updated) {
              backup();
            }
          });
        };

        scope.restore = function() {
          scope.classInfo = angular.copy(scope.savedInfo);
          scope.dirty = false;
        };

        /// Adds all selected books to the class's book list.
        scope.addSelectedBooks = function() {
          var select = element[0].querySelector('.book-selection');
          for (let option of select.options) {
            if (option.selected) {
             scope.classInfo.books[option.value] = scope.items[option.value];
             scope.dirty = true;
            }
          }
        };

        scope.export = function() {
          var classInfo = scope.classInfo;
          if (!classInfo.books) return;

          var classes;
          function getClasses() {
            var term = classInfo.term;
            var dep = classInfo.department_id;
            var year = parseInt(classInfo.start_year);
            return rpc.get_class_book_lists(year).then(function(response) {
                return classes = utils.where(response.data, 
                  function(classInfo) {
                return classInfo.term == term;
              });
            });
          }
          
          var orders;
          function getOrders() {
            var date = new Date();
            date.setMonth(date.getMonth() - 3);
            var timeOf3MonthAgo = date.getTime();

            var filters = {
              items: true,
              class_id: utils.keys(classes)
            };
            return rpc.get_orders(null, filters).then(function(response){
              return orders = response.data.filter(function(order) {
                var created_time = utils.fromMysqlTime(order.created_time);
                return created_time.getTime() >= timeOf3MonthAgo;
              });
            });
          }

          function doExport() {
            var data = '序号\t组长姓名';
            var bookIds = utils.keys(classInfo.books);
            bookIds.forEach(function(id) {
              var book = classInfo.books[id];
              data += '\t' + book.name;
              if (parseFloat(book.price)) {
                data += '\t';
              }
            });
            data += '\t\n\t';
            bookIds.forEach(function(id) {
              var book = classInfo.books[id];
              if (parseFloat(book.price)) {
                data += '\t法本订购数\t自费金额';
              } else {
                data += '\t数量';
              }
            });
            data += '\t总金额\n';

            var stats = {};
            orders.forEach(function(order) {
              var classStat = stats[order.class_name] ||
                  (stats[order.class_name] = {});
              order.items.forEach(function(item) {
                  var itemStat = classStat[item.item_id] ||
                      (classStat[item.item_id] = {price: 0.0, count: 0});
                  itemStat.count += parseInt(item.count);
                  itemStat.price += parseFloat(item.price) *
                      parseInt(item.count);
              });
            });

            var index = 1;
            for (var className in stats) {
              var classStat = stats[className];
              data += '{0}\t{1}'.format(index++, className);
              bookIds.forEach(function(item_id) {
                var free = !parseFloat(classInfo.books[item_id].price);
                var itemStat = classStat[item_id];
                if (itemStat) {
                  data += '\t{0}'.format(itemStat.count);
                  if (!free) {
                    data += '\t{0}'.format(itemStat.price);
                  }
                } else {
                  data += '\t{0}'.format(free ? '' : '\t');
                }
              });
            }
            classInfo.stats = utils.createDataUrl(data, classInfo.stats);
            return utils.truePromise();
          }

          utils.requestOneByOne([getClasses, getOrders, doExport]);
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
        function isBook(item) {
          if (parseInt(item.deleted)) return false;
          var category = scope.categories[item.category];
          return category && parseInt(category.parent_id) == 1;
        }
        function convertNumbers() {
          utils.forEach(scope.classInfo.books, function(book) {
            book.category = parseInt(book.category);
            book.price = parseFloat(book.price);
            book.shipping = parseFloat(book.shipping);
            book.int_shipping = parseFloat(book.int_shipping);
          });
        }
        function getDepartmentBooks() {
          var dep = scope.departments[scope.classInfo.department_id];
          return rpc.get_items(null, parseInt(dep.level)).then(function(response) {
            scope.classInfo.books = utils.where(response.data, isBook);
            convertNumbers();
            return scope.items = scope.classInfo.books;
          });
        }
        function getBookList() {
          var term = scope.classInfo.term;
          var depId = scope.classInfo.department_id;
          return rpc.get_book_list(depId, term).then(function(response) {
            scope.classInfo.books = {};
            (response.data || []).forEach(function(id) {
              scope.classInfo.books[id] = scope.items[id];
            });
            backup();
            return true;
          });
        }
        function backup() {
          scope.savedInfo = angular.copy(scope.classInfo);
          scope.dirty = false;
        }
      },
      templateUrl : 'js/book_list_details/book_list_details.html?tag=201812022012'
    };
  });
});
