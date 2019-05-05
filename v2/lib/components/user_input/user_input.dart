import 'package:angular/angular.dart';
import 'package:angular_components/material_input/material_auto_suggest_input.dart';
import 'package:angular_components/model/observable/observable.dart';
import 'package:angular_components/utils/disposer/disposer.dart';
import 'package:staff/model/user.dart';
import 'package:staff/services/user_service.dart';
import 'package:stream_transform/stream_transform.dart';

@Component(
  selector: 'user-input',
  directives: [
    MaterialAutoSuggestInputComponent,
  ],
  templateUrl: 'user_input.html',
  styles: ['material-auto-suggest-input {width: 100%;}'],
)
class UserInputComponent implements OnDestroy {
  static final _cache = <String, User>{};

  final UserService _userService;

  final suggestions = <String>[];

  final _disposer = Disposer.oneShot();
  final _user = ObservableReference<int>(null);

  @ViewChild(MaterialAutoSuggestInputComponent)
  set input(MaterialAutoSuggestInputComponent input) {
    if (input == null) return;
    _disposer.addStreamSubscription(input.textChanged
        .transform(debounce(Duration(milliseconds: 100)))
        .listen(_inputChanged));
  }

  @Input()
  set user(int user) {
    _user.value = user;
    _init();
  }

  @Output()
  Stream get userChange => _user.stream;

  String selection;

  UserInputComponent(this._userService);

  Future<void> _init() async {
    for (var user in _cache.values) {
      if (user.id == _user.value) {
        suggestions
          ..clear()
          ..add(user.displayLabel);
        selection = user.displayLabel;
        return;
      }
    }

    var label = await _userService.getUserLabel(_user.value);
    suggestions
      ..clear()
      ..add(label);
    selection = label;
  }

  Future<void> _inputChanged(String input) async {
    if (input.isEmpty) {
      _user.value = null;
      return;
    }

    var cached = _cache[input];
    if (cached == null) {
      var users = await _userService.searchByName(input);
      suggestions.clear();
      for (var user in users) {
        _cache[user.displayLabel] = user;
        suggestions.add(user.displayLabel);
      }
      cached = _cache[input];
    }
    if (cached != null) {
      _user.value = cached.id;
      print('===user id assigned to ${cached.id}');
    }
  }

  @override
  void ngOnDestroy() {
    _disposer.dispose();
  }

  void selectionChange(String selection) {}
}
