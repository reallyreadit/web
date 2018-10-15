import * as React from 'react';
import EventPageApi from '../EventPageApi';
import ExtensionState from '../../common/ExtensionState';
import NavBar from '../../../common/components/NavBar';
import logoText from '../../../common/svg/logoText';
import warningTriangle from '../../../common/svg/warningTriangle';
import ArticleDetails from '../../../common/components/ArticleDetails';
import ScreenKey from '../../../common/routing/ScreenKey';
import routes from '../../../common/routing/routes';
import { findRouteByKey } from '../../../common/routing/Route';
import DialogKey from '../../../common/routing/DialogKey';
import UserArticle from '../../../common/models/UserArticle';

export default class extends React.Component<{}, ExtensionState> {
	private _openInNewTab = (path: string) => window.open(`${config.web.protocol}://${config.web.host}${path}`, '_blank');
	private _showSignInDialog = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Home, DialogKey.SignIn).createUrl());
	private _showCreateAccountDialog = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Home, DialogKey.CreateAccount).createUrl());
	private _goToInbox = () => (
		this.state.showNewReplyIndicator ?
			this._eventPageApi.ackNewReply() :
			Promise.resolve({})
		)
		.then(() => {
			this._openInNewTab(findRouteByKey(routes, ScreenKey.Inbox).createUrl())
		});
	private _goToStarred = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Starred).createUrl());
	private _goToHistory = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.History).createUrl());
	private _goToComments = () => {
		this._openInNewTab(findRouteByKey(routes, ScreenKey.ArticleDetails).createUrl(this.getArticleUrlParams()));
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
	private _showShareDialog = () => {
		this._openInNewTab(findRouteByKey(routes, ScreenKey.ArticleDetails,  DialogKey.ShareArticle).createUrl(this.getArticleUrlParams()));
	};
	private _preventDefault = (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
	};
	private _eventPageApi = new EventPageApi({ onPushState: state => this.setState(state) });
	constructor(props: {}) {
		super(props);
		this.state = {
			isAuthenticated: false,
			isOnHomePage: false,
			showNewReplyIndicator: false,
			focusedTab: null,
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
			this.state.isAuthenticated && this.state.isOnHomePage ?
				<div className="app">
					<div className="ready-indicator">
						<h1>Go read something!</h1>
					</div>
				</div> :
				<div className="app">
					<h1>
						<a href={`${config.web.protocol}://${config.web.host}`} target="_blank" dangerouslySetInnerHTML={{ __html: logoText }}></a>
					</h1>
					{!this.state.isAuthenticated ?
						<div className="signed-out-warning">
							<i dangerouslySetInnerHTML={{ __html: warningTriangle }}></i>
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
								onRead={this._preventDefault}
								onShare={this._showShareDialog}
								onToggleStar={this._toggleStar}
								onViewComments={this._goToComments}
							/> :
							<div className="article-placeholder">
								No article found on page
							</div> :
						null}
				</div>
		);
	}
}