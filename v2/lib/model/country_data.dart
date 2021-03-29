@JS('bicw')
library bicw;

import 'package:js/js.dart';

@JS()
@anonymous
abstract class CountryData {
  external String getCountryCode(int index);
  external String getCountryLabel(String code);
  external int getCountryIndex(String code);

  /// Returns map from country code to full name:
  ///  e.g. 'US' => 'United States'.
  external Map<String, String> getCountryMap();
  external String getState(int countryIndex, stateIndex);
  external int getStateIndex(String countryCode, String state);
  external List<String> getStates(int countryIndex);

  external String getUSStateCode(String state);
}

@JS()
@anonymous
external CountryData getCountryData();
