import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from './Button';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Footer from './Footer';
import UserAccount from '../../../../common/models/UserAccount';

export default class NavBar extends React.PureComponent<{
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyReads: () => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: () => void,
	onViewStats: () => void,
	selectedScreenKey: ScreenKey,
	user: UserAccount
}> {
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
							<label>Discover</label>
						</Button>
					</li>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.MyReads).createUrl()}
							onClick={this.props.onViewMyReads}
							style={this.props.selectedScreenKey === ScreenKey.MyReads ? 'loud' : 'normal'}
						>
							<Icon name="star" />
							<label>My Reads</label>
						</Button>
					</li>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName: this.props.user.name })}
							onClick={this.props.onViewProfile}
							style={this.props.selectedScreenKey === ScreenKey.Profile ? 'loud' : 'normal'}
						>
							<Icon name="user" />
							<label>Profile</label>
						</Button>
					</li>
					<li>
						<Button
							href={findRouteByKey(routes, ScreenKey.Stats).createUrl()}
							onClick={this.props.onViewStats}
							style={this.props.selectedScreenKey === ScreenKey.Stats ? 'loud' : 'normal'}
						>
							<Icon name="line-chart" />
							<label>Stats</label>
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
				<Footer onViewPrivacyPolicy={this.props.onViewPrivacyPolicy} />
			</div>
		);
	}
}