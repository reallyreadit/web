import * as React from 'react';
import EventPageApi from '../EventPageApi';
import UserArticle from '../../common/UserArticle';
import CommentsActionLink from '../../../common/components/CommentsActionLink';
import PercentCompleteIndicator from '../../../common/components/PercentCompleteIndicator';

export default class App extends React.Component<{}, {
	isAuthenticated?: boolean,
	userArticle?: UserArticle,
	showOverlay: boolean
}> {
	private _goToComments = () => {
		const slugParts = this.state.userArticle.slug.split('_');
		window.open(`${config.web.protocol}://${config.web.host}/articles/${slugParts[0]}/${slugParts[1]}`, '_blank');
	};
	private _toggleOverlay = (e: React.ChangeEvent<HTMLInputElement>) => {
		EventPageApi.updateShowOverlay(e.currentTarget.checked);
		this.setState({ showOverlay: e.currentTarget.checked });
	};
	constructor() {
		super();
		this.state = { showOverlay: false };
		EventPageApi.getState().then(state => this.setState(state));
	}
	public render() {
		return (
			<div className="app">
				<h1><a id="home-link" href={`${config.web.protocol}://${config.web.host}`} target="_blank">reallyread.it</a></h1>
				{this.state.userArticle ?
					<div id="article-info">
						<h2 id="article-title">
							{this.state.userArticle.title.length > 48 ?
								this.state.userArticle.title.substr(0, 48).trim() + '...' :
								this.state.userArticle.title}
						</h2>
						<PercentCompleteIndicator percentComplete={this.state.userArticle.percentComplete} />
						<span> - </span>
						<CommentsActionLink commentCount={this.state.userArticle.commentCount} onClick={this._goToComments} />
					</div> :
					<div id="article-placeholder">
						No article found on page
					</div>}
				<fieldset id="settings">
					<legend>Settings</legend>
					<label><input id="show-overlay" type="checkbox" checked={this.state.showOverlay} onChange={this._toggleOverlay} />Show overlay</label>
				</fieldset>
			</div>
		);
	}
}