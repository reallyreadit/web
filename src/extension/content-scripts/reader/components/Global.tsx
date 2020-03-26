import * as React from 'react';
import DialogManager from '../../../../common/components/DialogManager';
import Toaster, { Toast } from '../../../../common/components/Toaster';
import ClipboardTextInput from '../../../../common/components/ClipboardTextInput';
import DialogService, { Dialog } from '../../../../common/services/DialogService';
import ToasterService from '../../../../common/services/ToasterService';
import ClipboardService from '../../../../common/services/ClipboardService';
import InfoBox from '../../../../common/components/InfoBox';
import * as classNames from 'classnames';

export enum GlobalError {
	None,
	ArticleLookupFailure,
	UserSignedOut
}
export default (
	props: {
		clipboardService: ClipboardService,
		dialogs: Dialog[],
		dialogService: DialogService,
		error: GlobalError,
		toasterService: ToasterService,
		toasts: Toast[]
	}
) => (
	<div className={classNames('global_x82v08', { 'error': props.error !== GlobalError.None })}>
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
		{props.error !== GlobalError.None ?
			<InfoBox
				position="absolute"
				style="warning"
			>
				{props.error === GlobalError.ArticleLookupFailure ?
					<p>An error occurred while processing this article.</p> :
					<p>You were signed out of your account in another tab.</p>}
			</InfoBox> :
			null}
	</div>
);