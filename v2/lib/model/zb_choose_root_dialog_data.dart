import 'package:v2/model/class_info.dart';
import 'package:v2/model/dialog_data.dart';

class ZBChooseRootDialogData extends DialogData {
  static const chooseRoot = 'zb-choose-root-dialog';

  final ClassInfo classInfo;
  ZBChooseRootDialogData(this.classInfo): super(chooseRoot);
}
