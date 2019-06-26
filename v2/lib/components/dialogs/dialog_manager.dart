import 'package:angular/angular.dart';
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

  @ViewChild('location', read: ViewContainerRef)
  ViewContainerRef location;

  DialogManagerComponent(this._dialogService, this._loader) {
    _listenDialogInvokeRequests();
  }

  Future _listenDialogInvokeRequests() async {
    await for (var data in _dialogService.requests) {
      var factory = _dialogFactories[data?.dialogId];
      if (factory == null) continue;
      var componentRef = _loader.loadNextToLocation(factory, location);
      componentRef.instance.open(data);
    }
  }
}
