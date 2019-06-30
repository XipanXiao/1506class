import 'package:angular/angular.dart';
import 'package:v2/model/report_grid.dart';
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

  Future<List<RxlTaskData>> getRxlTaskData(String taskDataQuery) async {
    var url = '$_serviceUrl$_file?${taskDataQuery}';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    List list = map['data'] ?? [];
    return list.map<RxlTaskData>((user) => RxlTaskData.fromJson(user)).toList();
  }

  Future<bool> _isAuthenticated() async {
    _progressService.showProgress('Checking zhibei.info login credentials');
    var url = '$_serviceUrl/pre/check_edit_password_ajax'
        '?type=get_edit_permission';
    try {
      await utils.httpGetObject(_getProxiedUrl(url));
      return true;
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

  Future<bool> login(String user, String password, String captcha) async {
    _progressService.showProgress('Signing into zhibei.info');
    var url = '$_serviceUrl/account/login?type=login&username=$user'
        '&password=$password&captcha=$captcha';
    try {
      var response = await utils.httpGetObject(_getProxiedUrl(url));
      return response['returnValue'] == 'true';
    } finally {
      _progressService.done();
    }
  }
}