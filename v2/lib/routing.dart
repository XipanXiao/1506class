class Routing {
  static String getClassRouting(int classId) {
    return '/#/class/$classId';
  }

  static const classRouting = '/#/class/:id';
  static const termRouting = '/#/class/:id/half_term/:term';
}
