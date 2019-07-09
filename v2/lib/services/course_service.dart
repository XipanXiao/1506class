import 'dart:async';

import 'package:angular/angular.dart';
import 'package:v2/model/course.dart';

import 'package:v2/utils.dart' as utils;

@Injectable()
class CourseService {
  static const _serviceUrl = 'php/services.php';
  final _cache = <int, Course>{};

  Future<Map<int, Course>> getCourses() async {
    if (_cache.isNotEmpty) return _cache;

    var url = '$_serviceUrl?rid=courses';
    var map = await utils.httpGetObject(url);
    for (var id in map.keys) {
      _cache[int.parse(id)] = Course.fromJson(map[id]);
    }
    return _cache;
  }

  Future<Course> getCourseById(int id) async {
    var course = _cache[id];
    if (course != null) return course;

    var url = '$_serviceUrl?rid=courses&id=$id';
    var map = await utils.httpGetObject(url);
    for (var id in map.keys) {
      _cache[int.parse(id)] = Course.fromJson(map[id]);
    }
    return _cache[id];
  }
}
