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
  /// A map from [groupId] to [ZBGroup] of all groups.
  static final _groupTree = <String, ZBGroup>{};

  final String id;
  final String html;
  final String groupId;
  final String parentId;
  final String value;

  ZBGroup.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        groupId = map['groupId'],
        parentId = map['parentid'],
        value = map['value'],
        html = _getHtmlText(map['html']);

  static void setAllGropus(Iterable<ZBGroup> groups) {
    for (var group in groups) {
      if (!group.isEmpty) {
        _groupTree[group.id] = group;
      }
    }
  }

  static String _getHtmlText(String html) {
    var document = parse(html);
    return parse(document.body.text).documentElement.text;
  }

  bool get _hasChildren =>
      _groupTree.values.any((group) => group.parentId == id);

  bool get isEmpty => value.isEmpty;

  static Iterable<ZBGroup> get roots =>
      _groupTree.values.where((group) => group._hasChildren);

  Iterable<ZBGroup> get children =>
      _groupTree.values.where((group) => group.parentId == id);
}

class ZBSubGroup {
  final String id;
  final String name;
  final String role;

  ZBSubGroup.fromJson(Map<String, dynamic> map)
      : id = map['id'],
        name = map['name'],
        role = map['role'];

  @override
  String toString() => '$name($role)';
}
