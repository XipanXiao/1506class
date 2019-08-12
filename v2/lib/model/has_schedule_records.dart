abstract class AbstractScheduleRecord {
  bool get isNotEmpty;
}

abstract class HasScheduleRecords {
  int get att;
  Map<int, AbstractScheduleRecord> get records;
}
