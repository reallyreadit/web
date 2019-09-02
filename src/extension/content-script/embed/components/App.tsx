import * as React from 'react';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ClipboardTextInput from '../../../../common/components/ClipboardTextInput';
import Toaster from '../../../../common/components/Toaster';
import ClipboardService from '../../../../common/services/ClipboardService';
import { createUrl } from '../../../../common/HttpEndpoint';
import ToasterService, { State as ToasterState } from '../../../../common/services/ToasterService';
import DialogService, { State as DialogState } from '../../../../common/services/DialogService';
import AsyncTracker from '../../../../common/AsyncTracker';
import UserArticle from '../../../../common/models/UserArticle';
import Logo from './Logo';
import Fetchable from '../../../../common/Fetchable';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount from '../../../../common/models/UserAccount';
import PostDialog from '../../../../common/components/PostDialog';
import DialogManager from '../../../../common/components/DialogManager';
import CommentsSection from '../../../../common/components/comments/CommentsSection';
import PostForm from '../../../../common/models/social/PostForm';
import Post from '../../../../common/models/social/Post';
import PostPrompt from '../../../../common/components/PostPrompt';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';

export interface Props {
	article?: UserArticle
	comments?: Fetchable<CommentThread[]>,
	onPostArticle: (form: PostForm) => Promise<Post>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	user?: UserAccount
}
export default class App extends React.Component<
	Props,
	ToasterState &
	DialogState
> {
	// clipboard
	private readonly _clipboard = new ClipboardService(
		(content, intent) => {
			this._toaster.addToast(content, intent);
		}
	);

	// dialogs
	private readonly _dialog = new DialogService({
		setState: delegate => {
			this.setState(delegate);
		}
	})
	protected readonly _openPostDialog = (article: UserArticle) => {
		this._dialog.openDialog(
			<PostDialog
				articleId={article.id}
				onCloseDialog={this._dialog.closeDialog}
				onShowToast={this._toaster.addToast}
				onSubmit={this.props.onPostArticle}
			/>
		);
	};

	// profile links
	private readonly _viewProfile = (userName: string) => {
		window.open(
			this._createAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName })
			),
			'_blank'
		);
	};

	// routing
	private readonly _createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.extension.config.web, path);

	// sharing
	private readonly _handleShareRequest = () => {
		return [
			ShareChannel.Clipboard,
			ShareChannel.Email,
			ShareChannel.Twitter
		];
	};

	// toasts
	private readonly _toaster = new ToasterService({
		asyncTracker: new AsyncTracker(),
		setState: (state: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
			this.setState(state);
		}
	});
	constructor(props: Props) {
		super(props);
		this.state = {
			toasts: []
		};
	}
	public render() {
		return (
			<div className="app_5ii7ja">
				{this.props.article ?
					<>
						<Logo />
						<PostPrompt
							article={this.props.article}
							onPost={this._openPostDialog}
							promptMessage="Post this article on Readup."
						/>
					</> :
					null}
				{this.props.article && this.props.comments && this.props.comments.value ?
					<CommentsSection
						article={this.props.article}
						comments={this.props.comments.value}
						imagePath="./images"
						noCommentsMessage="No comments on this article yet."
						onCopyTextToClipboard={this._clipboard.copyText}
						onCreateAbsoluteUrl={this._createAbsoluteUrl}
						onPostComment={this.props.onPostComment}
						onShare={this._handleShareRequest}
						onViewProfile={this._viewProfile}
						user={this.props.user}
					/> :
					null}
				{this.state.dialog ?
					<DialogManager
						dialog={this.state.dialog.element}
						isClosing={this.state.dialog.isClosing}
						onRemove={this._dialog.removeDialog}
						style="light"
						verticalAlignment="top"
					/> :
					null}
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
				<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
			</div>
		);
	}
}