import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from './Button';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Separator from '../../../../common/components/Separator';

export default class NavBar extends React.PureComponent<{
	onViewHistory: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewPrivacyPolicy: () => void,
	onViewStarred: () => void,
	selectedScreenKey: ScreenKey
}> {
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	public render() {
		return (
			<div className="nav-bar_yh8orf">
				<ol>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
							onClick={this.props.onViewHome}
							style={this.props.selectedScreenKey === ScreenKey.Home ? 'loud' : 'normal'}
						>
							<Icon name="books" />
							<label>Home</label>
						</Button>
					</li>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.Starred).createUrl()}
							onClick={this.props.onViewStarred}
							style={this.props.selectedScreenKey === ScreenKey.Starred ? 'loud' : 'normal'}
						>
							<Icon name="star" />
							<label>Starred</label>
						</Button>
					</li>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.History).createUrl()}
							onClick={this.props.onViewHistory}
							style={this.props.selectedScreenKey === ScreenKey.History ? 'loud' : 'normal'}
						>
							<Icon name="history" />
							<label>History</label>
						</Button>
					</li>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.Leaderboards).createUrl()}
							onClick={this.props.onViewLeaderboards}
							style={this.props.selectedScreenKey === ScreenKey.Leaderboards ? 'loud' : 'normal'}
						>
							<Icon name="podium" />
							<label>Leaderboards</label>
						</Button>
					</li>
				</ol>
				<div className="footer">
					<a href="https://blog.reallyread.it">Blog</a>
					<Separator />
					<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
					<Separator />
					<a
						href={findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()}
						onClick={this._viewPrivacyPolicy}
					>
						Privacy Policy
					</a>
					<br />
					<a href="mailto:support@reallyread.it">support@reallyread.it</a>
				</div>
			</div>
		);
	}
}