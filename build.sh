ln -s staff/web/index.html staff.html
cd staff
webdev build
cp .dart_tool/build/generated/staff/web/main.dart.js ../staff.js

