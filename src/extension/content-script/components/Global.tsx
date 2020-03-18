import * as React from 'react';
import DialogManager from '../../../common/components/DialogManager';
import Toaster, { Toast } from '../../../common/components/Toaster';
import ClipboardTextInput from '../../../common/components/ClipboardTextInput';
import DialogService, { Dialog } from '../../../common/services/DialogService';
import ToasterService from '../../../common/services/ToasterService';
import ClipboardService from '../../../common/services/ClipboardService';

export default (
	props: {
		clipboardService: ClipboardService,
		dialogs: Dialog[],
		dialogService: DialogService,
		toasterService: ToasterService,
		toasts: Toast[]
	}
) => (
	<>
		<DialogManager
			dialogs={props.dialogs}
			onTransitionComplete={props.dialogService.handleTransitionCompletion}
			style="light"
		/>
		<Toaster
			onRemoveToast={props.toasterService.removeToast}
			toasts={props.toasts}
		/>
		<ClipboardTextInput onSetRef={props.clipboardService.setTextInputRef} />
	</>
);