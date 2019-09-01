import 'package:html/parser.dart';

/// current_id: "g2452"
/// groupId: "2452"
/// html: "<i class='fa fa-star'></i> <span style='color:black;font-size:15px;font-weight:bold' >1302大组</span> <span style='color:#629101'>(大组长)</span> "
/// id: "g2452"
/// next_id: "g8700"
/// parentid: "g2451"
/// prior_id: ""
/// value: "2524%15%1234%NULL%"
class ZBGroup {
  final String id;
  final String html;

  ZBGroup.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        html = _getHtmlText(map['html']);

  static String _getHtmlText(String html) {
    var document = parse(html);
    return parse(document.body.text).documentElement.text;
  }
}
