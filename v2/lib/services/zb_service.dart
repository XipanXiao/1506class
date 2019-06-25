import 'package:angular/angular.dart';
import 'package:v2/model/report_grid.dart';
import 'package:v2/utils.dart' as utils;

@Injectable()
class ZBService {
  static const _proxyUrl = 'php/proxy.php';
  static const _redirectUrl = 'php/redirect.php';
  static const _serviceUrl = 'zbServiceUrl';
  static const _file = '/pre/report_ajax';

  static String _getProxiedUrl(String url) =>
      '$_proxyUrl?url=${Uri.encodeComponent(url)}';

  Future<List<RxlTaskData>> getRxlTaskData(ReportGrid grid) async {
    var url = '$_serviceUrl$_file?${grid.taskDataQuery}';
    var map = await utils.httpGetObject(_getProxiedUrl(url));
    List list = map['data'] ?? [];
    return list.map<RxlTaskData>((user) => RxlTaskData.fromJson(user)).toList();
  }

  Future<bool> isAuthenticated() async {
    var url = '$_serviceUrl/pre/check_edit_password_ajax'
        '?type=get_edit_permission';
    try {
      await utils.httpGetObject(_getProxiedUrl(url));
      return true;
    } catch (err) {
      return false;
    }
  }
}
