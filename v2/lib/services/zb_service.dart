import 'package:angular/angular.dart';
import 'package:v2/model/zb_task_data.dart';
import 'package:v2/services/dialog_service.dart';
import 'package:v2/services/progress_service.dart';
import 'package:v2/utils.dart' as utils;

@Injectable()
class ZBService {
  static const _proxyUrl = 'php/proxy.php';
  static const _redirectUrl = 'php/redirect.php';
  static const _serviceUrl = 'zbServiceUrl';
  static const _file = '/pre/report_ajax';

  static String _getProxiedUrl(String url) =>
      '$_proxyUrl?url=${Uri.encodeComponent(url)}';

  final DialogService _dialogService;
  final ProgressService _progressService;

  ZBService(this._dialogService, this._progressService);

  Future<Map<int, T>> getTaskData<T extends TaskData>(int pre_classID,
      String gridType, int halfTerm, TaskDataFromJson<T> creator) async {
    var taskDataQuery =
        'type=$gridType&pre_classID=$pre_classID&half_term=$halfTerm';
    var url = '$_serviceUrl$_file?${taskDataQuery}';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    List list = map['data'] ?? [];
    var users = list.map<T>((json) => creator(json));
    return Map<int, T>.fromIterable(users, key: (user) => user.userID);
  }

  Future<bool> _isAuthenticated() async {
    _progressService.showProgress('Checking zhibei.info login credentials');
    var url = '$_serviceUrl/pre/check_edit_password_ajax'
        '?type=get_edit_permission';
    try {
      var response = await utils.httpGetObject(_getProxiedUrl(url));
      return response['edit_permission'] == '1';
    } catch (err) {
      return false;
    } finally {
      _progressService.done();
    }
  }

  Future<bool> ensureAuthenticated() async {
    if (await _isAuthenticated()) return true;
    return await _dialogService.showZbLoginDialog();
  }

  Future<bool> edit(String editPassword) async {
    var url =
        '$_serviceUrl/pre/check_edit_password_ajax?type=check_edit_password'
        '&edit_password=$editPassword';
    var response = await utils.httpGetObject(_getProxiedUrl(url));
    return response['returnValue'] == 'true';
  }

  Future<bool> login(
      String user, String password, String editPassword, String captcha) async {
    _progressService.showProgress('Signing into zhibei.info');
    var url = '$_serviceUrl/account/login?type=login&username=$user'
        '&password=$password&captcha=$captcha';
    try {
      var response = await utils.httpGetObject(_getProxiedUrl(url));
      if (response['returnValue'] != 'true') return false;
      return await edit(editPassword);
    } finally {
      _progressService.done();
    }
  }

  Future<bool> reportTask(
      int pre_classID, int halfTerm, String gridType, TaskData data) async {
    _progressService.showProgress('Reporting for ${data.name}');

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
}
