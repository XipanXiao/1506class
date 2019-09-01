import 'package:angular/angular.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular_components/laminate/components/modal/modal.dart';
import 'package:angular_components/laminate/overlay/module.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_dialog/material_dialog.dart';
import 'package:v2/model/dialog_data.dart';
import 'package:v2/model/zb_choose_root_dialog_data.dart';
import 'package:v2/model/zb_group.dart';
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
  final ZBService _zbService;

  final zbGroups = SelectionOptions<ZBGroup>.fromList([]);
  final selection = SelectionModel<ZBGroup>.single();

  ZBChooseRootDialogComponent(this._zbService);

  void create() async {
    var chooseRootData = data as ZBChooseRootDialogData;
  }

  @override
  void open(DialogData data) async {
    super.open(data);

    if (!await _zbService.ensureAuthenticated()) return;

    var groups = await _zbService.getRootGroups();
    zbGroups.optionGroups = [
      OptionGroup.withLabel(
          groups.where((group) => !group.html.contains('Loading')).toList())
    ];
  }

  String getGroupLabel(group) => group.html;
}
