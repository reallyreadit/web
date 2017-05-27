import * as React from 'react';
import EventPageApi from '../EventPageApi';
import UserArticle from '../../common/UserArticle';
import CommentsActionLink from '../../../common/components/CommentsActionLink';
import PercentCompleteIndicator from '../../../common/components/PercentCompleteIndicator';
import BrowserActionAccountManager from './BrowserActionAccountManager';

export default class App extends React.Component<{}, {
	isAuthenticated?: boolean,
	userArticle?: UserArticle,
	isSigningOut: boolean
}> {
	private _signOut = () => {
		this.setState({ isSigningOut: true });
	};
	private _goToComments = () => {
		const slugParts = this.state.userArticle.slug.split('_');
		window.open(`${config.web.protocol}://${config.web.host}/articles/${slugParts[0]}/${slugParts[1]}`, '_blank');
	};
	constructor() {
		super();
		this.state = { isSigningOut: false };
		EventPageApi
			.getState()
			.then(state => this.setState({
				isAuthenticated: state.isAuthenticated,
				userArticle: state.userArticle
			}));
	}
	public render() {
		return (
			<div className="app">
				<h1>
					<a href={`${config.web.protocol}://${config.web.host}`} target="_blank">reallyread.it</a>
				</h1>
				<BrowserActionAccountManager
					userName={this.state.isAuthenticated ? '[user name]' : null}
					showNewReplyIndicator={false}
					onSignOut={this._signOut}
					isSigningOut={this.state.isSigningOut}
					/>
				{this.state.userArticle ?
					<div className="article-info">
						<h2>
							{this.state.userArticle.title.length > 48 ?
								this.state.userArticle.title.substr(0, 48).trim() + '...' :
								this.state.userArticle.title}
						</h2>
						<PercentCompleteIndicator percentComplete={this.state.userArticle.percentComplete} />
						<span> - </span>
						<CommentsActionLink commentCount={this.state.userArticle.commentCount} onClick={this._goToComments} />
					</div> :
					<div className="article-placeholder">
						No article found on page
					</div>}
			</div>
		);
	}
}