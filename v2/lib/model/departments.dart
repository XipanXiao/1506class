class Department {
  static const RUXINGLUN_DEPARTMENT = 2;
  static const JIAXING_DEPARTMENT = 3;
  static const JINGTU_DEPARTMENT = 4;

  static final _bicwDepIdToZBCourseId = <int, int>{
    RUXINGLUN_DEPARTMENT: 2,
    JIAXING_DEPARTMENT: 1,
    JINGTU_DEPARTMENT: 3,
  };

  static int getZBCourseId(int bicwDepId) => _bicwDepIdToZBCourseId[bicwDepId];
}
