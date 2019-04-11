import * as React from 'react';
import EventPageApi from '../EventPageApi';
import ExtensionState from '../../common/ExtensionState';
import NavBar from '../../../common/components/NavBar';
import ArticleDetails from '../../../common/components/ArticleDetails';
import ScreenKey from '../../../common/routing/ScreenKey';
import routes from '../../../common/routing/routes';
import { findRouteByKey } from '../../../common/routing/Route';
import DialogKey from '../../../common/routing/DialogKey';
import UserArticle from '../../../common/models/UserArticle';
import Toaster, { Toast } from '../../../common/components/Toaster';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import ClipboardTextInput from '../../../common/components/ClipboardTextInput';
import AsyncTracker from '../../../common/AsyncTracker';
import ShareChannel from '../../../common/sharing/ShareChannel';
import ClipboardService from '../../../common/services/ClipboardService';
import { createUrl } from '../../../common/HttpEndpoint';

export default class extends React.Component<{}, ExtensionState & { toasts: Toast[] }> {
	private _openInNewTab = (path: string) => window.open(this._createAbsoluteUrl(path), '_blank');
	private _showSignInDialog = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Home, DialogKey.SignIn).createUrl());
	private _showCreateAccountDialog = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Home, DialogKey.CreateAccount).createUrl());
	private _goToInbox = () => {
		if (this.state.showNewReplyIndicator) {
			this._eventPageApi.ackNewReply();
		}
		this._openInNewTab(findRouteByKey(routes, ScreenKey.Inbox).createUrl());
	};
	private _goToStarred = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Starred).createUrl());
	private _goToHistory = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.History).createUrl());
	private _goToComments = () => {
		this._openInNewTab(findRouteByKey(routes, ScreenKey.Comments).createUrl(this.getArticleUrlParams()));
	};
	private _toggleStar = () => {
		return this._eventPageApi
			.setStarred(this.state.userArticle.id, !this.state.userArticle.dateStarred)
			.then(() => this.setState({
				userArticle: {
					...this.state.userArticle,
					dateStarred: this.state.userArticle.dateStarred ? null : new Date().toISOString()
				}
			}));
	};
	private _preventDefault = (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
	};
	private _eventPageApi = new EventPageApi({ onPushState: state => this.setState(state) });

	// clipboard
	private readonly _clipboard = new ClipboardService(
		(content, intent) => {
			this._toaster.addToast(content, intent);
		}
	);

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

	constructor(props: {}) {
		super(props);
		this.state = {
			isAuthenticated: false,
			isOnHomePage: false,
			showNewReplyIndicator: false,
			focusedTab: null,
			toasts: [],
			userArticle: null
		};
		this._eventPageApi
			.load()
			.then(state => this.setState(state));
	}
	private getArticleUrlParams()  {
		const [sourceSlug, articleSlug] = this.state.userArticle.slug.split('_');
		return {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		};
	}
	public render() {
		return (
			<div className="app_79z645">
				<h1>
					<a
						href={this._createAbsoluteUrl('/')}
						target="_blank"
					>
						<img
							alt="logo"
							src="./images/logo.svg"
						/>
					</a>
				</h1>
				{!this.state.isAuthenticated ?
					<div className="signed-out-warning">
						<img
							alt="logo"
							src="./images/warning-triangle.svg"
						/>
						<span>You won't get credit for really reading until you sign in or create an account.</span>
					</div> :
					null}
				<NavBar
					isSignedIn={this.state.isAuthenticated}
					showNewReplyIndicator={this.state.showNewReplyIndicator}
					state={'normal'}
					onSignIn={this._showSignInDialog}
					onCreateAccount={this._showCreateAccountDialog}
					onGoToInbox={this._goToInbox}
					onGoToStarred={this._goToStarred}
					onGoToHistory={this._goToHistory}
					/>
				{this.state.isAuthenticated ?
					this.state.userArticle ?
						<ArticleDetails
							article={this.state.userArticle}
							isUserSignedIn={true}
							onCopyTextToClipboard={this._clipboard.copyText}
							onCreateAbsoluteUrl={this._createAbsoluteUrl}
							onRead={this._preventDefault}
							onShare={this._handleShareRequest}
							onToggleStar={this._toggleStar}
							onViewComments={this._goToComments}
							useAbsoluteUrls
						/> :
						!this.state.isOnHomePage ?
							<div className="article-placeholder">
								No article found on page
							</div> :
							null :
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