import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/laminate/components/modal/modal.dart';
import 'package:angular_components/laminate/overlay/module.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_dialog/material_dialog.dart';
import 'package:v2/model/class_info.dart';
import 'package:v2/model/departments.dart';
import 'package:v2/model/dialog_data.dart';
import 'package:v2/model/zb_choose_root_dialog_data.dart';
import 'package:v2/model/zb_group.dart';
import 'package:v2/services/class_service.dart';
import 'package:v2/services/zb_service.dart';

import 'package:v2/components/dialogs/abstract_dialog.dart';

@Component(
  selector: 'zb-choose-root-dialog',
  providers: [
    overlayBindings,
    materialProviders,
  ],
  directives: [
    coreDirectives,
    MaterialButtonComponent,
    MaterialDialogComponent,
    ModalComponent,
    MaterialDropdownSelectComponent,
  ],
  templateUrl: 'zb_choose_root_dialog.html',
  styleUrls: ['zb_choose_root_dialog.css'],
)
class ZBChooseRootDialogComponent extends AbstractDialog {
  final ClassService _classService;
  final ZBService _zbService;

  final zbGroups = SelectionOptions<ZBGroup>.fromList([]);
  final selection = SelectionModel<ZBGroup>.single();

  ZBChooseRootDialogComponent(this._zbService, this._classService);

  void create() async {
    if (selection.isEmpty || !await _zbService.ensureEditPermission()) {
      return;
    }

    var info = (data as ZBChooseRootDialogData).classInfo;
    var count = await _getClassCount(info);
    var startdate = '${info.start_year}-06-01';
    info.zb_id = await _zbService.createClass(
        selection.selectedValues.single.groupId,
        Department.getZBCourseId(info.department_id),
        startdate,
        '美国',
        count + 1);

    await _classService.updateClass(info);
  }

  @override
  void open(DialogData data) async {
    if (!await _zbService.ensureAuthenticated()) return;

    super.open(data);
    var groups = await _zbService.getRootGroups();
    zbGroups.optionGroups = [
      OptionGroup.withLabel(
          groups.where((group) => !group.html.contains('Loading')).toList())
    ];
  }

  /// Returns the number of classes in the department [depId]
  /// of the year [startYear].
  Future<int> _getClassCount(ClassInfo classInfo) async {
    var classes = await _classService.getClasses();
    return classes.values
        .where((info) =>
            info.department_id == classInfo.department_id &&
            info.start_year == classInfo.start_year)
        .length;
  }

  String getGroupLabel(group) => group.html;
}
