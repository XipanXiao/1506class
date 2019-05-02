import 'dart:html';

/// Returns the Apache url (:80) instead of webdev (:8080) url
/// to server php scripts, in local environment.
String checkUrl(String url) =>
  window.location.hostname == 'localhost' ? 'http://localhost/$url' : url;
