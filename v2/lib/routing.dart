class Routing {
  static const classRouting = '/#/class/:id';
  static const termRouting = '/#/class/:id/half_term/:half_term';

  static String getClassRouting(int classId) {
    return '/#/class/$classId';
  }
  static String getHalfTermRouting(int classId, int half_term) {
    return '/#/class/$classId/half_term/$half_term';
  }
}
