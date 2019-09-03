import 'dart:convert';

import 'package:angular/angular.dart';
import 'package:v2/model/base_entity.dart';
import 'package:v2/model/guanxiu_record.dart';
import 'package:v2/model/has_schedule_records.dart';
import 'package:v2/model/lesson.dart';
import 'package:v2/model/schedule_record.dart';
import 'package:v2/model/schedule_task_data.dart';
import 'package:v2/model/user.dart';
import 'package:v2/model/zb_group.dart';
import 'package:v2/model/zb_jt_task_data.dart';
import 'package:v2/model/zb_rxl_task_data.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/model/zb_user_class_info.dart';
import 'package:v2/services/dialog_service.dart';
import 'package:v2/services/progress_service.dart';
import 'package:v2/utils.dart' as utils;

@Injectable()
class ZBService {
  static const _proxyUrl = 'php/proxy.php';
  static const _serviceUrl = 'zbServiceUrl';
  static const _file = '/pre/report_ajax';

  static String _getProxiedUrl(String url) =>
      '$_proxyUrl?url=${Uri.encodeComponent(url)}';

  final DialogService _dialogService;
  final ProgressService _progressService;

  ZBService(this._dialogService, this._progressService);

  Future<Map<int, T>> getTaskData<T extends TaskData>(int pre_classID,
      String gridType, int halfTerm, TaskDataFromJson<T> creator) async {
    _progressService.showProgress(
        'Fetching task data for $gridType of the $halfTerm-th half term.');

    var taskDataQuery =
        'type=$gridType&pre_classID=$pre_classID&half_term=$halfTerm';
    var url = '$_serviceUrl$_file?${taskDataQuery}';
    try {
      var map = await utils.httpGetObject(_getProxiedUrl(url));
      List list = map['data'] ?? [];
      var users = list.map<T>((json) => creator(json));
      return Map<int, T>.fromIterable(users, key: (user) => user.userID);
    } finally {
      _progressService.done();
    }
  }

  Future<bool> canEdit() async {
    _progressService.showProgress('Checking zhibei.info login credentials');
    var url = '$_serviceUrl/pre/check_edit_password_ajax'
        '?type=get_edit_permission';
    try {
      var response = await utils.httpGetObject(_getProxiedUrl(url));
      return response['edit_permission'] == '1';
    } catch (err) {
      return null;
    } finally {
      _progressService.done();
    }
  }

  Future<bool> ensureAuthenticated() async {
    if (await canEdit() != null) return true;
    return await _dialogService.showZbLoginDialog();
  }

  Future<bool> ensureEditPermission() async {
    if (await canEdit() == true) return true;
    return await _dialogService.showZbLoginDialog(edit: true);
  }

  /// Enters editing mode with the [editPassword].
  Future<bool> edit(String editPassword) async {
    var url =
        '$_serviceUrl/pre/check_edit_password_ajax?type=check_edit_password'
        '&edit_password=$editPassword';
    _progressService.showProgress('Gaining edit permission from zhibei.info');
    try {
      var response = await utils.httpGetObject(_getProxiedUrl(url));
      return response['returnValue'] == 'true';
    } finally {
      _progressService.done();
    }
  }

  Future<bool> login(String user, String password, String editPassword) async {
    if (editPassword != null) {
      return await edit(editPassword);
    }

    _progressService.showProgress('Signing into zhibei.info');
    var url = '$_serviceUrl/account/login?type=login&username=$user'
        '&password=$password';
    try {
      var response = await utils.httpGetObject(_getProxiedUrl(url));
      return response['returnValue'] == 'true';
    } finally {
      _progressService.done();
    }
  }

  /// Get lesson names and ids for a given [half_term].
  Future<List<Lesson>> getLessons(
      int pre_classID, int courseID, int half_term) async {
    _progressService
        .showProgress('Fetching lessons of the $half_term-th half term.');

    var url =
        '$_serviceUrl/pre/report_ajax?courseID=$courseID&half_term=$half_term'
        '&type=pre_class_lessons&pre_classID=$pre_classID';
    try {
      var lessons = await utils.httpGetObject(_getProxiedUrl(url));
      return (lessons['data'] ?? [])
          .map<Lesson>((json) => Lesson.fromJson(json))
          .toList();
    } finally {
      _progressService.done();
    }
  }

  /// Given a schedule record responded from zhibei.info, returns a
  /// parsed map (keyed by lesson ids).
  ///
  /// The record is like:
  /// audio173: "1"
  /// audio174: "1"
  /// audio175: "1"
  /// audio176: "1"
  /// audio177: "1"
  /// ...
  /// book173: "1"
  /// book174: "1"
  /// book175: "0"
  /// book176: "1"
  /// book177: "1"
  /// ...
  /// name: "张三"
  /// operation: "0"
  /// select_all: "0"
  /// userID: "123623"
  /// user_style: "0"
  ///
  /// And the returning map is like:
  /// {
  ///     173: {video: 1, text: 1},
  ///     174: {video: 1, text: 1},
  ///     175: {video: 1, text: 0},
  ///     ...
  /// }
  ScheduleTaskData _parseScheduleRecord(
      int halfTerm, Map<String, dynamic> record) {
    var rawData = <int, Map<String, String>>{};

    void convertKey(String key, String prefix, String newKey) {
      int lesson_id = int.parse(key.substring(prefix.length));
      var schedule = rawData.putIfAbsent(
          lesson_id,
          () => <String, String>{
                'half_term': '$halfTerm',
              });
      schedule[newKey] = record[key];
    }

    for (var key in record.keys) {
      if (key.startsWith('audio')) {
        convertKey(key, 'audio', 'video');
      } else if (key.startsWith('book')) {
        convertKey(key, 'book', 'text');
      }
    }
    var scheduleRecords = rawData
        .map((key, value) => MapEntry(key, ScheduleRecord.fromJson(value)));
    var data = ScheduleTaskData.fromJson(record);
    data.scheduleRecords.addAll(scheduleRecords);
    return data;
  }

  /// Fetches all users' schedule records from zhibei.info,
  /// for the class identified by [pre_classID] and the
  /// [halfTerm].
  ///
  /// Returns the map (keyed by userID) of maps (keyed by lesson id).
  Future<Map<int, ScheduleTaskData>> getScheduleRecords(
      int pre_classID, int halfTerm,
      {String grid = 'main_course_grid'}) async {
    var taskDataQuery =
        'type=$grid&pre_classID=$pre_classID&half_term=$halfTerm';
    var url = '$_serviceUrl$_file?${taskDataQuery}';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    List list = map['data'] ?? [];
    return Map.fromIterable(list,
        key: (json) => int.parse(json['userID']),
        value: (json) => _parseScheduleRecord(halfTerm, json));
  }

  Future<bool> reportTask(
      int pre_classID, int halfTerm, String gridType, TaskData data) async {
    _progressService.showProgress('Reporting task for ${data.name}');

    var extraData = {
      'pre_classID': '$pre_classID',
      'type': gridType,
      'half_term': '$halfTerm',
      'url': '$_serviceUrl$_file',
    };

    try {
      var response =
          await utils.httpPostObject(_proxyUrl, data, extraData: extraData);
      return response['returnValue'] == 'success';
    } finally {
      _progressService.done();
    }
  }

  Future<bool> reportScheduleTask(String gridType, int pre_classID,
      int half_term, TaskDataWithLessons user) async {
    _progressService.showProgress('Reporting for ${user.name}');
    var data = <String, dynamic>{
      'url': '$_serviceUrl/pre/report_ajax',
      'pre_classID': pre_classID,
      'type': gridType,
      'half_term': half_term,
    };
    var entries = data.entries.toList()..addAll(user.toFormData());

    try {
      var response = await utils.httpPostFormData(_proxyUrl, entries);
      return response != null && response['returnValue'] == 'success';
    } finally {
      _progressService.done();
    }
  }

  /// Returns the [GuanxiuRecord] of the certain class, keyed by
  /// zhibei user id.
  Future<Map<int, GuanxiuRecord>> getGuanxiuRecords(
      int pre_classID, int halfTerm, Iterable<Lesson> lessons) async {
    var taskDataQuery =
        'type=guanxiu_grid&pre_classID=$pre_classID&half_term=$halfTerm';
    var url = '$_serviceUrl$_file?${taskDataQuery}';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    List list = map['data'] ?? [];
    var records =
        list.map<GuanxiuRecord>((map) => GuanxiuRecord.fromJson(map, lessons));
    return Map<int, GuanxiuRecord>.fromIterable(records,
        key: (record) => record.userID);
  }

  /// Fetches task data and att/limit records.
  Future<Map<int, T>> getLimitTaskData<T extends ScheduleTaskData>(String grid,
      int pre_classID, int halfTerm, TaskDataFromJson<T> creator) async {
    var taskDataQuery =
        'type=$grid&pre_classID=$pre_classID&half_term=$halfTerm';
    var url = '$_serviceUrl$_file?${taskDataQuery}';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    List list = map['data'] ?? [];
    var records = list.map<T>((map) {
      var record = creator(map);
      var scheduleRecord = _parseScheduleRecord(halfTerm, map);
      return record..scheduleRecords.addAll(scheduleRecord.scheduleRecords);
    });
    return Map<int, T>.fromIterable(records, key: (record) => record.userID);
  }

  Future<Map<int, JtTaskData>> getJtTaskData(int pre_classID, int halfTerm) =>
      getLimitTaskData<JtTaskData>('fohao_att_limit_grid', pre_classID,
          halfTerm, (json) => JtTaskData.fromJson(json));

  Future<Map<int, RxlTaskData>> getRxlTaskData(int pre_classID, int halfTerm) =>
      getLimitTaskData<RxlTaskData>('rxl_work_grid', pre_classID, halfTerm,
          (json) => RxlTaskData.fromJson(json));

  Future<Iterable<User>> getUsers(int pre_classID) async {
    var url = '$_serviceUrl/pre/classinfo_ajax?&type=pre_class_user_list'
        '&pre_classID=$pre_classID';
    try {
      var map = await utils.httpGetObject(_getProxiedUrl(url));
      List list = map['data'] ?? [];
      return list.map<User>((map) => User.fromJson(map));
    } on FormatException catch (exception) {
      print('Failed to get users for $pre_classID: $exception');
      return [];
    }
  }

  Future<Iterable<ZBGroup>> getRootGroups() async {
    var url = '$_serviceUrl/pre/classselect_ajax?type=init_root_tree';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    return (map['data'] ?? []).map<ZBGroup>((group) => ZBGroup.fromJson(group));
  }

  /// Creates a new pre class under the parent group identified by
  /// [groupId], with department id [courseId].
  ///
  /// [localID] is the basically the index in the same department.
  ///  For example for a class named, '19届美国加行2组':
  ///  startdate: 2019
  ///  courseId: 3 (Jia xing)
  ///  district1: 美国
  ///  localID: 2
  Future<int> createClass(String groupId, int courseId, String startdate,
      String district1, int localID) async {
    var data = <String, String>{
      'url': '$_serviceUrl/pre/classselect_ajax',
      'pre_groupID': groupId,
      'type': 'add_pre_class',
      'district1': district1,
      'district2': '',
      'courseID': '$courseId',
      'startDate': startdate,
      'localID': '$localID',
      'study_style': '2',
      'note': ''
    };
    _progressService.showProgress('Creating new class');

    try {
      var response =
          await utils.httpPostObject(_proxyUrl, BaseEntity(), extraData: data);
      return response['returnValue'];
    } finally {
      _progressService.done();
    }
  }

  Future<bool> createUser(int pre_classID, User user) async {
    var data = <String, String>{
      'url': '$_serviceUrl/pre/classinfo_ajax',
      'type': 'add_user',
      'pre_classID': '$pre_classID',
    };

    return await _post(user, data, 'Creating new user for ${user.name}');
  }

  Future<bool> updateUser(User user) async {
    var data = <String, String>{
      'url': '$_serviceUrl/user/basic_ajax',
    };
    return await _post(user, data, 'Updating user for ${user.name}');
  }

  Future<ZBUserClassInfo> getUserClassInfo(int userID) async {
    var url = '$_serviceUrl/user/basic?userID=$userID';
    var response = await utils.httpGetObject(_getProxiedUrl(url));
    var html = response['data'];
    var m = RegExp(r'var history_classes_json = (\[.+\]);').firstMatch(html);
    if (m == null) return null;

    var histories = jsonDecode(m.group(1));
    // The first entry of the histories list has the most updated class info.
    return histories.first;
  }

  Future<bool> recoverUser(int pre_classID, int userID, String name) async {
    var data = <String, dynamic>{
      'url': '$_serviceUrl/pre/classinfo_ajax',
      'type': 'recover_users',
      'pre_classID': '$pre_classID',
      'userIDs': '${[userID]}',
    };
    return await _post(BaseEntity(), data, 'Recovering deleted user for $name');
  }

  Future<bool> transferUser(
      int userID, int fromID, int toID, String reason) async {
    var data = <String, String>{
      'url': '$_serviceUrl/pre/classinfo_ajax',
      'type': 'transfer_users',
      'userIDs': '${[userID]}',
      'pre_classID': '$fromID',
      'dst_pre_classID': '$toID',
      'reason': reason,
    };
    return await _post(BaseEntity(), data, 'Transfer user $userID to $toID');
  }

  Future<bool> _post(
      BaseEntity data, Map<String, String> extraData, String status) async {
    _progressService.showProgress(status);

    try {
      var response =
          await utils.httpPostObject(_proxyUrl, data, extraData: extraData);
      return response['returnValue'] == 'true';
    } finally {
      _progressService.done();
    }
  }
}
