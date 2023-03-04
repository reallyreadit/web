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
import * as classNames from 'classnames';
import ShareChannel from '../sharing/ShareChannel';
import Toaster, { Intent } from '../components/Toaster';
import ToasterService, {
	State as ToasterState,
} from '../services/ToasterService';
import DialogService, { DialogServiceState } from '../services/DialogService';
import AsyncTracker from '../AsyncTracker';
import UserArticle from '../models/UserArticle';
import Fetchable from '../Fetchable';
import CommentThread from '../models/CommentThread';
import UserAccount from '../models/UserAccount';
import PostDialog from '../components/PostDialog';
import DialogManager from '../components/DialogManager';
import CommentsSection from '../components/comments/CommentsSection';
import PostForm from '../models/social/PostForm';
import Post from '../models/social/Post';
import {
	ShareEvent,
	createRelativeShareSelection,
} from '../sharing/ShareEvent';
import PostPrompt from '../components/PostPrompt';
import CommentForm from '../models/social/CommentForm';
import CommentDeletionForm from '../models/social/CommentDeletionForm';
import CommentAddendumForm from '../models/social/CommentAddendumForm';
import CommentRevisionForm from '../models/social/CommentRevisionForm';
import ContentBox from '../components/ContentBox';
import SpinnerIcon from '../components/SpinnerIcon';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';
import AuthServiceProvider from '../models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../models/auth/AuthServiceAccountAssociation';
import ReaderHeader from '../components/ReaderHeader';
import ArticleIssueReportRequest from '../models/analytics/ArticleIssueReportRequest';
import DisplayPreference, {
	getDisplayPreferenceChangeMessage,
} from '../models/userAccounts/DisplayPreference';
import ShareResponse from '../sharing/ShareResponse';
import { DeviceType } from '../DeviceType';
import { ShareChannelData } from '../sharing/ShareData';
import ClipboardService from '../services/ClipboardService';
import ClipboardTextInput from '../components/ClipboardTextInput';
import { createQueryString } from '../routing/queryString';
import { createTweetWebIntentUrl } from '../sharing/twitter';
import { AppPlatform } from '../AppPlatform';

export interface Props extends DialogServiceState {
	appPlatform: AppPlatform;
	article: Fetchable<UserArticle>;
	comments: Fetchable<CommentThread[]> | null;
	deviceType: DeviceType;
	dialogService: DialogService<{}>;
	displayPreference: DisplayPreference | null;
	isHeaderHidden: boolean;
	onChangeDisplayPreference: (
		preference: DisplayPreference
	) => Promise<DisplayPreference>;
	onCreateAbsoluteUrl: (path: string) => string;
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>;
	onLinkAuthServiceAccount: (
		provider: AuthServiceProvider
	) => Promise<AuthServiceAccountAssociation>;
	onNavBack: () => void;
	onNavTo: (url: string) => boolean;
	onPostArticle: (form: PostForm) => Promise<Post>;
	onPostComment: (form: CommentForm) => Promise<void>;
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>;
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>;
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void;
	onShare: (data: ShareEvent) => ShareResponse;
	onToggleStar: () => Promise<void>;
	user: UserAccount | null;
}
/**
 * A host for reader-related UI & behavior that should be injected after
 * the main article content in a native reader DOM context. It handles, amongst others,
 * - global header UI (fixed on top)
 * - global toaster UI (fixed overlay)
 * - global dialog UI (fixed overlay)
 * - comment section UI
 */
export default class ReaderUIEmbed extends React.Component<
	Props,
	ToasterState
> {
	// article issue reports
	private readonly _reportArticleIssue = (
		request: ArticleIssueReportRequest
	) => {
		this.props.onReportArticleIssue(request);
		this._toaster.addToast('Issue Reported', Intent.Success);
	};

	// clipboard
	protected readonly _clipboard = new ClipboardService((content, intent) => {
		this._toaster.addToast(content, intent);
	});

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
			this.props.onCreateAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName })
			)
		);
	};

	// sharing
	private readonly _handleShareChannelRequest = (data: ShareChannelData) => {
		switch (data.channel) {
			case ShareChannel.Clipboard:
				this._clipboard.copyText(data.text, 'Link copied to clipboard');
				break;
			case ShareChannel.Email:
				this.props.onNavTo(
					`mailto:${createQueryString({
						body: data.body,
						subject: data.subject,
					})}`
				);
				break;
			case ShareChannel.Twitter:
				this.props.onNavTo(createTweetWebIntentUrl(data));
				break;
		}
	};
	private readonly _handleShareRequest = (data: ShareEvent) => {
		if (this.props.appPlatform === AppPlatform.Ios) {
			this.props.onShare({
				...data,
				selection: createRelativeShareSelection(data.selection, window),
			});
			return {
				channels: [] as ShareChannel[],
			};
		} else {
			return {
				channels: [
					ShareChannel.Clipboard,
					ShareChannel.Email,
					ShareChannel.Twitter,
				],
			};
		}
	};

	// toasts
	private readonly _toaster = new ToasterService({
		asyncTracker: new AsyncTracker(),
		setState: (delegate) => {
			this.setState(delegate);
		},
	});

	// user accounts
	private readonly _changeDisplayPreference = (
		preference: DisplayPreference
	) => {
		if (this.props.displayPreference) {
			const message = getDisplayPreferenceChangeMessage(
				this.props.displayPreference,
				preference
			);
			if (message) {
				this._toaster.addToast(message, Intent.Success);
			}
		}
		return this.props.onChangeDisplayPreference(preference);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			toasts: [],
		};
	}
	public render() {
		return (
			<div className="reader-embed_2818km">
				{this.props.article.value?.isRead ? (
					<PostPrompt
						article={this.props.article.value}
						onPost={this._openPostDialog}
						promptMessage="Post this article."
					/>
				) : null}
				{this.props.article.value && this.props.comments && this.props.user ? (
					this.props.comments.isLoading ? (
						<ContentBox className="loading-comments">
							<SpinnerIcon /> Loading comments...
						</ContentBox>
					) : (
						<CommentsSection
							article={this.props.article.value}
							comments={this.props.comments.value}
							noCommentsMessage="No comments on this article yet."
							onCloseDialog={this.props.dialogService.closeDialog}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onDeleteComment={this.props.onDeleteComment}
							onNavTo={this.props.onNavTo}
							onOpenDialog={this.props.dialogService.openDialog}
							onPostComment={this.props.onPostComment}
							onPostCommentAddendum={this.props.onPostCommentAddendum}
							onPostCommentRevision={this.props.onPostCommentRevision}
							onShare={this._handleShareRequest}
							onShareViaChannel={this._handleShareChannelRequest}
							onViewProfile={this._viewProfile}
							user={this.props.user}
						/>
					)
				) : null}
				<div
					className={classNames('header-container', {
						hidden: this.props.isHeaderHidden,
					})}
				>
					<ReaderHeader
						article={this.props.article}
						displayPreference={this.props.displayPreference}
						deviceType={this.props.deviceType}
						isHidden={this.props.isHeaderHidden}
						onNavBack={this.props.onNavBack}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onChangeDisplayPreference={this._changeDisplayPreference}
						onReportArticleIssue={this._reportArticleIssue}
						onShare={this._handleShareRequest}
						onShareViaChannel={this._handleShareChannelRequest}
						onToggleStar={this.props.onToggleStar}
					/>
				</div>
				<DialogManager
					dialogs={this.props.dialogs}
					onGetDialogRenderer={this.props.dialogService.getDialogRenderer}
					onTransitionComplete={
						this.props.dialogService.handleTransitionCompletion
					}
					sharedState={{}}
				/>
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
				<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
			</div>
		);
	}
}
