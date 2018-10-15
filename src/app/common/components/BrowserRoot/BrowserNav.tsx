import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import BrowserButton from './BrowserButton';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';

export default class extends React.PureComponent<{
	onViewHistory: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewStarred: () => void,
	selectedScreenKey: ScreenKey
}, {}> {
	public render() {
		return (
			<ol className="browser-nav">
				<li>
					<BrowserButton
						href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
						onClick={this.props.onViewHome}
						style={this.props.selectedScreenKey === ScreenKey.Home ? 'loud' : 'normal'}
					>
						<Icon name="home" />
						<label>Home</label>
					</BrowserButton>
				</li>
				<li>
					<BrowserButton
						href={findRouteByKey(routes, ScreenKey.Starred).createUrl()}
						onClick={this.props.onViewStarred}
						style={this.props.selectedScreenKey === ScreenKey.Starred ? 'loud' : 'normal'}
					>
						<Icon name="star" />
						<label>Starred</label>
					</BrowserButton>
				</li>
				<li>
					<BrowserButton
						href={findRouteByKey(routes, ScreenKey.History).createUrl()}
						onClick={this.props.onViewHistory}
						style={this.props.selectedScreenKey === ScreenKey.History ? 'loud' : 'normal'}
					>
						<Icon name="clock" />
						<label>History</label>
					</BrowserButton>
				</li>
				<li>
					<BrowserButton 
						href={findRouteByKey(routes, ScreenKey.Leaderboards).createUrl()}
						onClick={this.props.onViewLeaderboards}
						style={this.props.selectedScreenKey === ScreenKey.Leaderboards ? 'loud' : 'normal'}
					>
						<Icon name="line-chart" />
						<label>Leaderboards</label>
					</BrowserButton>
				</li>
			</ol>
		);
	}
}