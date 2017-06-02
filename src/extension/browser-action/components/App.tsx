import * as React from 'react';
import EventPageApi from '../EventPageApi';
import UserArticle from '../../common/UserArticle';
import CommentsActionLink from '../../../common/components/CommentsActionLink';
import PercentCompleteIndicator from '../../../common/components/PercentCompleteIndicator';
import NavBar from '../../../common/components/NavBar';
import Icon from '../../../common/components/Icon';

export default class App extends React.Component<{}, {
	isAuthenticated?: boolean,
	isOnHomePage?: boolean,
	userArticle?: UserArticle
}> {
	private _openInNewTab = (path: string) => window.open(`${config.web.protocol}://${config.web.host}${path}`, '_blank');
	private _showSignInDialog = () => this._openInNewTab('');
	private _showCreateAccountDialog = () => this._openInNewTab('');
	private _goToInbox = () => this._openInNewTab('/inbox');
	private _goToReadingList = () => this._openInNewTab('/list');
	private _goToSettings = () => this._openInNewTab('/settings');
	private _goToComments = () => {
		const slugParts = this.state.userArticle.slug.split('_');
		this._openInNewTab(`/articles/${slugParts[0]}/${slugParts[1]}`);
	};
	constructor() {
		super();
		this.state = {};
		EventPageApi
			.getState()
			.then(state => this.setState(state));
	}
	public render() {
		return (
			this.state.isAuthenticated && this.state.isOnHomePage ?
				<div className="app">
					<div className="ready-indicator">
						<h1>
							<span className="ready-circle">
								<Icon name="checkmark" />
							</span>
							<span>Ready to read!</span>
						</h1>
					</div>
				</div> :
				<div className="app">
					<h1>
						<a href={`${config.web.protocol}://${config.web.host}`} target="_blank">reallyread.it</a>
					</h1>
					<NavBar
						isSignedIn={this.state.isAuthenticated}
						showNewReplyIndicator={false}
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
								<h2>{this.state.userArticle.title}</h2>
								<PercentCompleteIndicator percentComplete={this.state.userArticle.percentComplete} />
								<span> - </span>
								<CommentsActionLink commentCount={this.state.userArticle.commentCount} onClick={this._goToComments} />
							</div> :
							<div className="article-placeholder">
								No article found on page
							</div> :
						null}
				</div>
		);
	}
}