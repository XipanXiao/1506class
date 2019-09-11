class BaseEntity {
  /// Returns a [Map] as POST data when reporting to zhibei.info.
  ///
  /// Some students are transferred from another country. As the
  /// result they do not have data in bicw database, but they do
  /// have in zhibei.info database. When reporting, we should not
  /// simply replace zhibei.info results with bicw results, which
  /// basically erases all of their data.
  /// Instead, we do not erase remote data unless explicitly asked
  /// by the reporter.
  /// The returned [Map] has the value form the [remote] object if
  /// [this] object has 0 for a certain map entry. Otherwise it has
  /// the value from [this] object.
  ///
  /// Consider the following example:
  ///     bicwData: {dingli_count: 0, guiyi_count: 100},
  ///   zhibeiData: {dingli_count: 200, guiyi_count: 121},
  /// The return value will be:
  ///               {dingli_count: 200, guiyi_count: 100}.
  Map<String, String> toMap({BaseEntity remote}) => {};

  /// Returns the [String] value of [a] if it has a value, otherwise of [b].
  String or<T extends num>(T a, T b) =>
      ((a ?? 0) == 0 ? (b ?? 0) : (a ?? 0)).toString();
}
