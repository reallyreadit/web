import * as React from 'react';
import DialogManager from '../../../../common/components/DialogManager';
import Toaster, { Toast } from '../../../../common/components/Toaster';
import ClipboardTextInput from '../../../../common/components/ClipboardTextInput';
import DialogService, { Dialog } from '../../../../common/services/DialogService';
import ToasterService from '../../../../common/services/ToasterService';
import ClipboardService from '../../../../common/services/ClipboardService';
import InfoBox from '../../../../common/components/InfoBox';
import * as classNames from 'classnames';
import ReaderHeader, { Props as HeaderProps } from '../../../../common/components/ReaderHeader';
import ArticleIssueReportRequest from '../../../../common/models/analytics/ArticleIssueReportRequest';

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
		header: Pick<HeaderProps, 'article' | 'isHidden'>,
		onReportArticleIssue: (request: ArticleIssueReportRequest) => void,
		toasterService: ToasterService,
		toasts: Toast[]
	}
) => (
	<div className={classNames('global_x82v08', { 'error': !!props.error })}>
		<ReaderHeader
			article={props.header.article}
			isHidden={props.header.isHidden}
			onReportArticleIssue={props.onReportArticleIssue}
			showProgressBar={false}
		/>
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