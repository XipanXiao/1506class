import 'dart:convert';
import 'dart:html';

/// Returns the Apache url (:80) instead of webdev (:8080) url
/// to server php scripts, in local environment.
String _checkUrl(String url) => window.location.hostname == 'localhost'
    ? 'http://localhost/1506class/$url'
    : url;

Future<String> httpGetString(String url) async =>
    HttpRequest.getString(_checkUrl(url), withCredentials: true);

Future<dynamic> httpGetObject(String url) async =>
    jsonDecode(await httpGetString(url));

void login() {
  var index = window.location.pathname.lastIndexOf("/") + 1;
  var filename = window.location.pathname.substring(index);
  var url = 'login.html?redirect=$filename${window.location.search}&tag=2019';
  window.open(Uri.encodeFull(_checkUrl(url)), '_self');
}
