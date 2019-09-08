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
  /// Root nodes.
  static final roots = <ZBGroup>[];

  final String id;
  final String html;
  final String groupId;
  final String parentId;
  final String value;

  final children = <ZBGroup>[];

  ZBGroup.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        groupId = map['groupId'],
        parentId = map['parentid'],
        value = map['value'],
        html = _getHtmlText(map['html']);

  ZBGroup.fromSubGroup(this.parentId, ZBSubGroup subGroup)
      : id = 'g${subGroup.id}',
        groupId = subGroup.id,
        value = subGroup.name,
        html = '${subGroup.name}(${subGroup.role})';

  static void setAllGropus(Iterable<ZBGroup> groups) {
    groups = groups.where((group) => !group.isEmpty).toList();
    for (var group in groups) {
      group.children
          .addAll(groups.where((child) => child.parentId == group.id));
    }
    roots
      ..clear()
      ..addAll(groups.where((group) => group._hasChildren));
  }

  static String _getHtmlText(String html) {
    var document = parse(html);
    return parse(document.body.text).documentElement.text;
  }

  bool get _hasChildren =>
      children.isNotEmpty || html.contains('大组长') || html.contains('中组长');

  bool get isEmpty => value.isEmpty;
}

class ZBSubGroup {
  final String id;
  final String name;
  final String role;

  ZBSubGroup.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        name = map['name'],
        role = map['role'];

  bool get isGroup => role == '小组长';
}
