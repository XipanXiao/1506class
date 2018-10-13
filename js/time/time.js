define('time/time', [], function() {
  return angular.module('TimeModule', [])
    .directive('time', function() {
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
            if (date.getFullYear() > 1900) {
              return '{0}-{1}-{2} {3}'.format(date.getFullYear(),
                  date.getMonth() + 1, date.getDate(), timestring);
            } else {
              return timestring;
            }
          });
        }
      };
    });
});
