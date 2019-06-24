./aggregate.sh
cd v2 
webdev build
cp .dart_tool/build/generated/v2/web/staff.dart.js ../
cp .dart_tool/build/generated/v2/web/report.dart.js web
