import 'package:angular/angular.dart';
import 'package:angular_components/material_button/material_button.dart';
import 'package:angular_components/material_datepicker/material_datepicker.dart';
import 'package:angular_components/material_datepicker/module.dart';
import 'package:angular_components/material_icon/material_icon.dart';
import 'package:angular_components/material_input/material_input.dart';
import 'package:angular_components/material_input/material_number_accessor.dart';
import 'package:angular_components/material_radio/material_radio_group.dart';
import 'package:angular_components/material_radio/material_radio.dart';
import 'package:angular_forms/angular_forms.dart';
import 'package:v2/components/user_input/user_input.dart';
import 'package:v2/model/user.dart';
import 'package:v2/services/user_service.dart';

@Component(
  selector: 'staff-editor',
  directives: [
    formDirectives,
    materialInputDirectives,
    materialNumberInputDirectives,
    MaterialButtonComponent,
    MaterialDatepickerComponent,
    MaterialIconComponent,
    MaterialRadioComponent,
    MaterialRadioGroupComponent,
    UserInputComponent,
  ],
  providers: [datepickerBindings],
  templateUrl: 'staff_editor.html',
  styleUrls: ["staff_editor.css"],
)
class StaffEditorComponent {
  static const pages = 2;

  final UserService _userService;

  @Input()
  User user;

  StaffEditorComponent(this._userService);

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

  Future<void> save() async {
    await _userService.updateUser(user);
    pageIndex = 2;
  }
}
