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
		error: string | null,
		toasterService: ToasterService,
		toasts: Toast[]
	}
) => (
	<div className={classNames('global_x82v08', { 'error': !!props.error })}>
		<DialogManager
			dialogs={props.dialogs}
			onTransitionComplete={props.dialogService.handleTransitionCompletion}
		/>
		<Toaster
			onRemoveToast={props.toasterService.removeToast}
			toasts={props.toasts}
		/>
		<ClipboardTextInput onSetRef={props.clipboardService.setTextInputRef} />
		{props.error ?
			<InfoBox
				position="absolute"
				style="warning"
			>
				<p>An error occurred while processing the article:</p>
				<p>{props.error}</p>
			</InfoBox> :
			null}
	</div>
);