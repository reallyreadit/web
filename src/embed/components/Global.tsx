// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import DialogManager from '../../common/components/DialogManager';
import Toaster, { Toast } from '../../common/components/Toaster';
import ClipboardTextInput from '../../common/components/ClipboardTextInput';
import DialogService, {
	DialogState,
} from '../../common/services/DialogService';
import ToasterService from '../../common/services/ToasterService';
import ClipboardService from '../../common/services/ClipboardService';
import InfoBox from '../../common/components/InfoBox';
import * as classNames from 'classnames';
import ProgressIndicator from './ProgressIndicator';
import UserArticle from '../../common/models/UserArticle';
import KeyValuePair from '../../common/KeyValuePair';

export enum GlobalError {
	None,
	ArticleLookupFailure,
	UserSignedOut,
}
export interface Props {
	article: UserArticle;
	clipboardService: ClipboardService;
	dialogs: KeyValuePair<number, DialogState>[];
	dialogService: DialogService<{}>;
	error: string | null;
	toasterService: ToasterService;
	toasts: Toast[];
}
export default (props: Props) => (
	<div className={classNames('global_lutpij', { error: !!props.error })}>
		<ProgressIndicator article={props.article} />
		<DialogManager
			dialogs={props.dialogs}
			onGetDialogRenderer={props.dialogService.getDialogRenderer}
			onTransitionComplete={props.dialogService.handleTransitionCompletion}
			sharedState={{}}
		/>
		<Toaster
			onRemoveToast={props.toasterService.removeToast}
			toasts={props.toasts}
		/>
		<ClipboardTextInput onSetRef={props.clipboardService.setTextInputRef} />
		{props.error ? (
			<InfoBox style="warning">
				<p>An error occurred while processing the article:</p>
				<p>{props.error}</p>
			</InfoBox>
		) : null}
	</div>
);
