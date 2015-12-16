# 1506class

Database Design
---------------
[Database structure](https://docs.google.com/document/d/1SACT2kfJpqAU_GyAZNAFLb-LTRKl3gU1wRCzh0vSRVQ/edit?usp=sharing)

[Access control](https://docs.google.com/document/d/1NxK2zozyfGPyECCN5seXgqHlCDPok4f0kDeiv4VNpAo/edit?usp=sharing)

Fontend Overview
----------------
### Dependencies
[RequireJS](http://requirejs.org/) is used to dynamically load JavaScript files on demand.

[AngularJS](https://angularjs.org/) is used to handle events and to define [custom directives](https://docs.angularjs.org/guide/directive). With the custom directives the page is built by blocks and looks really simple and clean, like:

```html
<iron-pages selected="0">
    <div>
		<tasks class="left" ng-controller="TasksController"></tasks>
		<schedule-tasks class="left" ng-controller="ScheduleTasksController"></schedule-tasks>
    </div>
    <div>
    	<div class="center">
	    	<h1>个人信息</h1>
	    	<user ng-controller="UserController"></user>
    	</div>
	</div>
</iron-pages>
```


Also [Polymer](https://www.polymer-project.org/1.0/) is used as the widget library.

### Module management and custom directives
[RequireJS](http://requirejs.org/) and [AngularJS](https://angularjs.org/) are used to define modules and separate the application to small pieces. So a typical directive (or componet if you prefer this name) looks like:

```JavaScript
define(['services'], function() {
	return angular.module('UserModule', ['ServicesModule'])
		.controller('UserController', function($scope, rpc) {
			$scope.$on('user-loaded', function(event, user) {
				$scope.user = user;
			});
		})
		.directive('user', function() {
			return {
				templateUrl : 'js/user/user.html'
			};
		});
});`
```

To hackers
----------
阿弥陀佛！如果您莅临本站，敬请高抬贵手，本站不盈利不作恶，是给五明佛学院的在线学员上课用的平台，一心服务大众。感恩！顶礼！
Amitabha! If you break into this site, please don't delete the data. This site is not profitable and it does no evil. It is a platform to maintain our learning records of the Wumin Buddhist College students. Thanks! Bow!
