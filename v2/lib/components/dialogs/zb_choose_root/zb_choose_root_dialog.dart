import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/laminate/components/modal/modal.dart';
import 'package:angular_components/laminate/overlay/module.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_dialog/material_dialog.dart';
import 'package:angular_forms/angular_forms.dart';
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
    MaterialDropdownSelectComponent,
    MaterialRadioComponent,
    MaterialRadioGroupComponent,
    ModalComponent,
    formDirectives,
  ],
  templateUrl: 'zb_choose_root_dialog.html',
  styleUrls: ['zb_choose_root_dialog.css'],
)
class ZBChooseRootDialogComponent extends AbstractDialog {
  final ClassService _classService;
  final ZBService _zbService;

  final rootGroups = SelectionOptions<ZBGroup>.fromList([]);
  final root = SelectionModel<ZBGroup>.single();

  final groups = <ZBGroup>[];
  ZBGroup selected;

  ZBChooseRootDialogComponent(this._zbService, this._classService);

  void create() async {
    if (selected == null) return;

    var info = (data as ZBChooseRootDialogData).classInfo;
    var count = await _getClassCount(info);
    var startdate = '${info.start_year}-06-01';
    info.zb_id = await _zbService.createClass(
        selected.groupId,
        Department.getZBCourseId(info.department_id),
        startdate,
        '美国',
        count + 1);

    await _classService.updateClass(info);
  }

  @override
  void open(DialogData data) async {
    super.open(data);
    ZBGroup.setAllGropus(await _zbService.getRootGroups());
    rootGroups.optionGroups = [
      OptionGroup.withLabel(
          ZBGroup.roots.toList()..sort((a, b) => a.html.compareTo(b.html)))
    ];
    root.select(_getDefaultRoot());
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

  /// Fills the [groups] list when [root] changes.
  Future<void> populateGroups() async {
    var group = root.selectedValues.first;
    if (group.children.isEmpty) {
      var subgroups = await _zbService.getSubGroups(group.groupId);
      group.children.addAll(subgroups
          .where((subGroup) => subGroup.isGroup)
          .map((subGroup) => ZBGroup.fromSubGroup(group.groupId, subGroup)));
    }
    groups
      ..clear()
      ..addAll(group.children);
  }

  ZBGroup _getDefaultRoot() {
    var info = (data as ZBChooseRootDialogData).classInfo;
    int year = (info.start_year ?? 0) % 100;
    return rootGroups.optionsList.firstWhere(
        (group) => group.html.startsWith('$year'),
        orElse: () => rootGroups.optionsList.first);
  }
}
