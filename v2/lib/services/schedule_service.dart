import 'dart:async';

import 'package:angular/angular.dart';
import 'package:v2/model/schedule.dart';
import 'package:v2/utils.dart' as utils;

@Injectable()
class ScheduleService {
  static const _serviceUrl = 'php/services.php';

  Future<List<ScheduleGroup>> getScheduleGroups(int classId,
      {int term = 0, String records = 'mine'}) async {
    var url = '$_serviceUrl?rid=learning_records'
        '&classId=$classId&term=$term&records=$records';
    Map map = await utils.httpGetObject(url);
    Map groups = map['groups'];
    return groups.values
        .map<ScheduleGroup>((value) => ScheduleGroup.fromJson(value))
        .toList();
  }
}
