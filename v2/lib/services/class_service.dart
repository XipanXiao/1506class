import 'dart:async';

import 'package:angular/angular.dart';
import 'package:v2/model/class_info.dart';

import 'package:v2/utils.dart' as utils;

@Injectable()
class ClassService {
  static const _serviceUrl = 'php/services.php';
  final _cache = <int, ClassInfo>{};

  Future<Map<int, ClassInfo>> getClasses() async {
    if (_cache.isNotEmpty) return _cache;

    var url = '$_serviceUrl?rid=classes';
    var map = await utils.httpGetObject(url);
    for (var id in map.keys) {
      _cache[int.parse(id)] = ClassInfo.fromJson(map[id]);
    }
    return _cache;
  }

  Future<ClassInfo> getClassById(int id) async {
    var classInfo = _cache[id];
    if (classInfo != null) return classInfo;

    var url = '$_serviceUrl?rid=classes&classId=$id';
    var map = await utils.httpGetObject(url);
    for (var id in map.keys) {
      _cache[int.parse(id)] = ClassInfo.fromJson(map[id]);
    }
    return _cache[id];
  }

  Future<bool> updateClass(ClassInfo info) async {
    var response = await utils.httpPostObject('$_serviceUrl?rid=classes', info);
    return int.tryParse(response['updated'] ?? '0') > 0;
  }
}
