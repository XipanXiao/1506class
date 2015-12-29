define(['services', 'utils', 'classes/classes'], function() {
	return angular.module('UserModule', ['ServicesModule', 'ClassesModule',
      'UtilsModule'])
		.controller('UserController', function($scope, rpc, utils) {
		  $scope.sexLabel = ['女', '男'];

      $scope.$on('user-loaded', function(event, user) {
				$scope.user = user;
			});
			
			$scope.save = function() {
			  var user = $scope.user;
        var data = {id: user.id};
			  switch ($scope.editing) {
        case 'name':
        case 'sex':
        case 'class_id':
          data[$scope.editing] = user[$scope.editing];
          break;
        case 'address':
          data.street = user.street;
          data.street2 = user.street2;
          data.city = user.city;
          data.state = user.state;
          data.zip = user.zip;
          break;
        default:
          return;
			  }
			  
			  rpc.update_user(data);
			};
			
      $scope.admining = window.location.href.indexOf('admin.html') > 0;
      $scope.stateMap = {
          "AL": "Alabama",
          "AK": "Alaska",
          "AS": "American Samoa",
          "AZ": "Arizona",
          "AR": "Arkansas",
          "CA": "California",
          "CO": "Colorado",
          "CT": "Connecticut",
          "DE": "Delaware",
          "DC": "District Of Columbia",
          "FM": "Federated States Of Micronesia",
          "FL": "Florida",
          "GA": "Georgia",
          "GU": "Guam",
          "HI": "Hawaii",
          "ID": "Idaho",
          "IL": "Illinois",
          "IN": "Indiana",
          "IA": "Iowa",
          "KS": "Kansas",
          "KY": "Kentucky",
          "LA": "Louisiana",
          "ME": "Maine",
          "MH": "Marshall Islands",
          "MD": "Maryland",
          "MA": "Massachusetts",
          "MI": "Michigan",
          "MN": "Minnesota",
          "MS": "Mississippi",
          "MO": "Missouri",
          "MT": "Montana",
          "NE": "Nebraska",
          "NV": "Nevada",
          "NH": "New Hampshire",
          "NJ": "New Jersey",
          "NM": "New Mexico",
          "NY": "New York",
          "NC": "North Carolina",
          "ND": "North Dakota",
          "MP": "Northern Mariana Islands",
          "OH": "Ohio",
          "OK": "Oklahoma",
          "OR": "Oregon",
          "PW": "Palau",
          "PA": "Pennsylvania",
          "PR": "Puerto Rico",
          "RI": "Rhode Island",
          "SC": "South Carolina",
          "SD": "South Dakota",
          "TN": "Tennessee",
          "TX": "Texas",
          "UT": "Utah",
          "VT": "Vermont",
          "VI": "Virgin Islands",
          "VA": "Virginia",
          "WA": "Washington",
          "WV": "West Virginia",
          "WI": "Wisconsin",
          "WY": "Wyoming"
      };
      
      $scope.states = utils.keys($scope.stateMap);
		})
		.directive('user', function() {
			return {
				templateUrl : 'js/user/user.html'
			};
		});
});
