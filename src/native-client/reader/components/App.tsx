import * as React from 'react';
import * as classNames from 'classnames';
import ShareChannel from '../../../common/sharing/ShareChannel';
import Toaster, { Intent } from '../../../common/components/Toaster';
import { createUrl } from '../../../common/HttpEndpoint';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import DialogService, { DialogServiceState } from '../../../common/services/DialogService';
import AsyncTracker from '../../../common/AsyncTracker';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../../../common/Fetchable';
import CommentThread from '../../../common/models/CommentThread';
import UserAccount from '../../../common/models/UserAccount';
import PostDialog from '../../../common/components/PostDialog';
import DialogManager from '../../../common/components/DialogManager';
import CommentsSection from '../../../common/components/comments/CommentsSection';
import PostForm from '../../../common/models/social/PostForm';
import Post from '../../../common/models/social/Post';
import { ShareEvent, createRelativeShareSelection } from '../../../common/sharing/ShareEvent';
import PostPrompt from '../../../common/components/PostPrompt';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import ContentBox from '../../../common/components/ContentBox';
import SpinnerIcon from '../../../common/components/SpinnerIcon';
import { findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import ScreenKey from '../../../common/routing/ScreenKey';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import ReaderHeader from '../../../common/components/ReaderHeader';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';
import DisplayPreference, { getDisplayPreferenceChangeMessage } from '../../../common/models/userAccounts/DisplayPreference';

export interface Props extends DialogServiceState {
	article: Fetchable<UserArticle>,
	comments: Fetchable<CommentThread[]> | null,
	dialogService: DialogService<{}>,
	displayPreference: DisplayPreference | null,
	isHeaderHidden: boolean,
	onChangeDisplayPreference: (preference: DisplayPreference) => Promise<DisplayPreference>,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onLinkAuthServiceAccount: (provider: AuthServiceProvider) => Promise<AuthServiceAccountAssociation>,
	onNavBack: () => void,
	onNavTo: (url: string) => boolean,
	onPostArticle: (form: PostForm) => Promise<Post>,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void,
	onShare: (data: ShareEvent) => void,
	user: UserAccount | null
}
export default class App extends React.Component<
	Props,
	ToasterState
> {
	// article issue reports
	private readonly _reportArticleIssue = (request: ArticleIssueReportRequest) => {
		this.props.onReportArticleIssue(request);
		this._toaster.addToast('Issue Reported', Intent.Success);
	};

	// clipboard
	private readonly _copyTextToClipboard = () => {
		// we don't need this since we're using native sharing
	};

	// dialogs
	protected readonly _openPostDialog = (article: UserArticle) => {
		this.props.dialogService.openDialog(
			<PostDialog
				article={article}
				onCloseDialog={this.props.dialogService.closeDialog}
				onLinkAuthServiceAccount={this.props.onLinkAuthServiceAccount}
				onOpenDialog={this.props.dialogService.openDialog}
				onShowToast={this._toaster.addToast}
				onSubmit={this.props.onPostArticle}
				user={this.props.user}
			/>
		);
	};

	// profile links
	private readonly _viewProfile = (userName: string) => {
		this.props.onNavTo(
			this._createAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName })
			)
		);
	};

	// routing
	private readonly _createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.nativeClient.reader.config.webServer, path);

	// sharing
	private readonly _handleShareRequest = (data: ShareEvent) => {
		this.props.onShare({
			...data,
			selection: createRelativeShareSelection(data.selection, window)
		});
		return {
			channels: [] as ShareChannel[]
		};
	};

	// toasts
	private readonly _toaster = new ToasterService({
		asyncTracker: new AsyncTracker(),
		setState: delegate => {
			this.setState(delegate);
		}
	});

	// user accounts
	private readonly _changeDisplayPreference = (preference: DisplayPreference) => {
		if (this.props.displayPreference) {
			const message = getDisplayPreferenceChangeMessage(this.props.displayPreference, preference);
			if (message) {
				this._toaster.addToast(message, Intent.Success);
			}
		}
		return this.props.onChangeDisplayPreference(preference);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			toasts: []
		};
	}
	public render() {
		return (
			<div className="app_n0jlkg">
				{this.props.article.value?.isRead ?
					<PostPrompt
						article={this.props.article.value}
						onPost={this._openPostDialog}
						promptMessage="Post this article."
					/> :
					null}
				{this.props.article.value && this.props.comments && this.props.user ?
					this.props.comments.isLoading ?
						<ContentBox className="loading-comments">
							<SpinnerIcon /> Loading comments...
						</ContentBox> :
						<CommentsSection
							article={this.props.article.value}
							comments={this.props.comments.value}
							noCommentsMessage="No comments on this article yet."
							onCloseDialog={this.props.dialogService.closeDialog}
							onCopyTextToClipboard={this._copyTextToClipboard}
							onCreateAbsoluteUrl={this._createAbsoluteUrl}
							onDeleteComment={this.props.onDeleteComment}
							onNavTo={this.props.onNavTo}
							onOpenDialog={this.props.dialogService.openDialog}
							onPostComment={this.props.onPostComment}
							onPostCommentAddendum={this.props.onPostCommentAddendum}
							onPostCommentRevision={this.props.onPostCommentRevision}
							onShare={this._handleShareRequest}
							onViewProfile={this._viewProfile}
							user={this.props.user}
						/> :
					null}
				<div className={classNames('header-container', { 'hidden': this.props.isHeaderHidden })}>
					<ReaderHeader
						article={this.props.article}
						displayPreference={this.props.displayPreference}
						isHidden={this.props.isHeaderHidden}
						onNavBack={this.props.onNavBack}
						onChangeDisplayPreference={this._changeDisplayPreference}
						onReportArticleIssue={this._reportArticleIssue}
					/>
				</div>
				<DialogManager
					dialogs={this.props.dialogs}
					onGetDialogRenderer={this.props.dialogService.getDialogRenderer}
					onTransitionComplete={this.props.dialogService.handleTransitionCompletion}
					sharedState={{}}
				/>
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}