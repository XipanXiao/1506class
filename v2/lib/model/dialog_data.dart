import 'dart:async';

class DialogData {
  /// [Completer] that resolves when the dialog closes.
  final completer = Completer();

  /// Identifier of the dialog to be invoked.
  final String dialogId;

  DialogData(this.dialogId);
}
