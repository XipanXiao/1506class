define('time/time', [], function() {
  return angular.module('TimeModule', [])
    .directive('time', function() {
      return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elements, attrs, ngModel) {
          ngModel.$formatters.push(function(timestring) {
            if (!timestring) return null;
            var parts = timestring.split(':');
            return new Date(0, 0, 0, parseInt(parts[0]), parseInt(parts[1]));
          });

          ngModel.$parsers.push(function(date) {
            var min = date.getMinutes();
            if (min < 10) min = '' + min + '0';
            return '' + date.getHours() + ':' + min + ':00';
          });
        }
      };
    }).directive('date', function() {
      return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elements, attrs, ngModel) {
          ngModel.$formatters.push(function(timestring) {
            return timestring && new Date(Date.parse(timestring));
          });

          ngModel.$parsers.push(function(date) {
            var min = date.getMinutes();
            if (min < 10) min = '0' + min;
            var sec = date.getSeconds();
            if (sec < 10) sec = '0' + sec;
            var timestring = '' + date.getHours() + ':' + min + ':' + sec;
            return '{0}-{1}-{2} {3}'.format(date.getFullYear(),
                date.getMonth() + 1, date.getDate(), timestring);
          });
        }
      };
    });
});
