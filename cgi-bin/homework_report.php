<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"></link>
<title>学修记录</title>
</head>

<body class="wide-body">

<?php
include_once "app_bar.php";
?>
<tasks class="left" ng-controller="TasksController"></tasks>
<schedules class="right" ng-controller="ScheduleTasksController"></schedules>

<script type="text/javascript" src="../js/angular.js"></script>
<script data-main="../js/homework_app.js" src="../js/require.js"></script>

</body>

</html>
