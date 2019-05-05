import 'package:angular/angular.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_datepicker/material_datepicker.dart';
import 'package:angular_components/material_datepicker/module.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:angular_components/material_input/material_input.dart';
import 'package:angular_components/material_radio/material_radio_group.dart';
import 'package:angular_components/material_radio/material_radio.dart';
import 'package:angular_forms/angular_forms.dart';
import 'package:staff/model/user.dart';

@Component(
  selector: 'staff-editor',
  directives: [
    formDirectives,
    materialInputDirectives,
    MaterialButtonComponent,
    MaterialDatepickerComponent,
    MaterialIconComponent,
    MaterialRadioComponent,
    MaterialRadioGroupComponent,
  ],
  providers: [datepickerBindings],
  templateUrl: 'staff_editor.html',
  styleUrls: ["staff_editor.css"],
)
class StaffEditorComponent {
  static const pages = 2;

  @Input()
  User user;

  int pageIndex = 0;

  void back() {
    if (pageIndex > 0) {
      pageIndex--;
    }
  }

  void next() {
    if (pageIndex < pages - 1) {
      pageIndex++;
    }
  }

  void save() {
  }
}
