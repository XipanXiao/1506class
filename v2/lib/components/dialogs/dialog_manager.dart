import 'package:angular/angular.dart';
import 'package:v2/components/dialogs/abstract_dialog.dart';
import 'package:v2/components/dialogs/zb_login_dialog/zb_login_dialog.template.dart';
import 'package:v2/services/dialog_service.dart';

@Component(
  selector: 'dialog-manager',
  template: '<template #location></template>',
)
class DialogManagerComponent {
  static final _dialogFactories = <String, ComponentFactory>{
    DialogService.zbLoginDialog: ZBLoginDialogComponentNgFactory,
  };

  final DialogService _dialogService;
  final ComponentLoader _loader;
  final _cache = <String, AbstractDialog>{};

  @ViewChild('location', read: ViewContainerRef)
  ViewContainerRef location;

  DialogManagerComponent(this._dialogService, this._loader) {
    _listenDialogInvokeRequests();
  }

  Future _listenDialogInvokeRequests() async {
    await for (var data in _dialogService.requests) {
      var dialog = _cache[data.dialogId];
      if (dialog == null) {
        var factory = _dialogFactories[data?.dialogId];
        if (factory == null) continue;
        var componentRef = _loader.loadNextToLocation(factory, location);
        dialog = componentRef.instance as AbstractDialog;
        _cache[data.dialogId] = dialog;
      }
      dialog.open(data);
    }
  }
}
