import * as React from 'react';
import EventPageApi from '../EventPageApi';
import ExtensionState from '../../common/ExtensionState';
import CommentsActionLink from '../../../common/components/CommentsActionLink';
import PercentCompleteIndicator from '../../../common/components/PercentCompleteIndicator';
import NavBar from '../../../common/components/NavBar';
import logoText from '../../../common/svg/logoText';
import Star from '../../../common/components/Star';
import ArticleLengthIndicator from '../../../common/components/ArticleLengthIndicator';
import warningTriangle from '../../../common/svg/warningTriangle';

export default class App extends React.Component<{}, ExtensionState & { isStarring: boolean }> {
	private _openInNewTab = (path: string) => window.open(`${config.web.protocol}://${config.web.host}${path}`, '_blank');
	private _goToHowItWorks = () => this._openInNewTab('/how-it-works');
	private _showSignInDialog = () => this._openInNewTab('/?sign-in');
	private _showCreateAccountDialog = () => this._openInNewTab('/?create-account');
	private _goToInbox = () => (this.state.showNewReplyIndicator ? this._eventPageApi.ackNewReply() : Promise.resolve({}))
		.then(() => this._openInNewTab('/inbox'));
	private _goToReadingList = () => this._openInNewTab('/list');
	private _goToSettings = () => this._openInNewTab('/settings');
	private _goToComments = () => {
		const slugParts = this.state.userArticle.slug.split('_');
		this._openInNewTab(`/articles/${slugParts[0]}/${slugParts[1]}`);
	};
	private _toggleStar = () => {
		this.setState({ isStarring: true });
		this._eventPageApi
			.setStarred(this.state.userArticle.id, !this.state.userArticle.dateStarred)
			.then(() => this.setState({
				userArticle: {
					...this.state.userArticle,
					dateStarred: this.state.userArticle.dateStarred ? null : new Date().toISOString()
				},
				isStarring: false
			}));
	};
	private _eventPageApi = new EventPageApi({ onPushState: state => this.setState(state) });
	constructor() {
		super();
		this.state = {
			isAuthenticated: false,
			isOnHomePage: false,
			showNewReplyIndicator: false,
			focusedTab: null,
			userArticle: null,
			isStarring: false
		};
		this._eventPageApi
			.load()
			.then(state => this.setState(state));
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
							<span>You won't get credit for <span onClick={this._goToHowItWorks}>really reading</span> until you sign in or create an account.</span>
						</div> :
						null}
					<NavBar
						isSignedIn={this.state.isAuthenticated}
						showNewReplyIndicator={this.state.showNewReplyIndicator}
						state={'normal'}
						onSignIn={this._showSignInDialog}
						onCreateAccount={this._showCreateAccountDialog}
						onGoToInbox={this._goToInbox}
						onGoToReadingList={this._goToReadingList}
						onGoToSettings={this._goToSettings}
						/>
					{this.state.isAuthenticated ?
						this.state.userArticle ?
							<div className="article-info">
								<div className="controls">
									<Star starred={!!this.state.userArticle.dateStarred} busy={this.state.isStarring} onClick={this._toggleStar} />
								</div>
								<div className="content">
									<div className="top-row">
										<h2>{this.state.userArticle.title}</h2>
										<ArticleLengthIndicator wordCount={this.state.userArticle.wordCount} />
									</div>
									<CommentsActionLink commentCount={this.state.userArticle.commentCount} onClick={this._goToComments} />
									<span> - </span>
									<PercentCompleteIndicator article={this.state.userArticle} />
								</div>
							</div> :
							<div className="article-placeholder">
								No article found on page
							</div> :
						null}
				</div>
		);
	}
}