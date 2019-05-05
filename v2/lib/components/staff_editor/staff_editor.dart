import 'package:angular/angular.dart';
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
    MaterialIconComponent,
    MaterialRadioComponent,
    MaterialRadioGroupComponent,
  ],
  templateUrl: 'staff_editor.html',
  styleUrls: ["staff_editor.css"],
)
class StaffEditorComponent {
  @Input()
  User user;
}
