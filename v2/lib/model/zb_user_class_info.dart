import 'package:v2/model/base_entity.dart';

class ZBUserClassInfo extends BaseEntity {
  final int pre_classID;
  final int status;

  ZBUserClassInfo.fromJson(Map<String, dynamic> map)
      : pre_classID = map['pre_classID'],
        status = map['status'];
}
