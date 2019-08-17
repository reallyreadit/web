import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from './Button';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Footer from './Footer';
import UserAccount from '../../../../common/models/UserAccount';
import { Screen } from '../Root';

const
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl(),
	profileRoute = findRouteByKey(routes, ScreenKey.Profile),
	statsUrl = findRouteByKey(routes, ScreenKey.Stats).createUrl(),
	leaderboardsUrl = findRouteByKey(routes, ScreenKey.Leaderboards).createUrl();

export default (props: {
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyReads: () => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: () => void,
	onViewStats: () => void,
	selectedScreen: Screen,
	user: UserAccount
}) => (
	<div className="nav-bar_yh8orf">
		<ol>
			<li>
				<Button
					href={homeUrl}
					onClick={props.onViewHome}
					style={props.selectedScreen.key === ScreenKey.Home ? 'loud' : 'normal'}
				>
					<Icon name="books" />
					<label>Discover</label>
				</Button>
			</li>
			<li>
				<Button
					href={myReadsUrl}
					onClick={props.onViewMyReads}
					style={props.selectedScreen.key === ScreenKey.MyReads ? 'loud' : 'normal'}
				>
					<Icon name="star" />
					<label>My Reads</label>
				</Button>
			</li>
			<li>
				<Button
					href={profileRoute.createUrl({ userName: props.user.name })}
					onClick={props.onViewProfile}
					style={
						(
							props.selectedScreen.key === ScreenKey.Profile &&
							profileRoute.getPathParams(props.selectedScreen.location.path)['userName'].toLowerCase() === props.user.name.toLowerCase()
						) ?
							'loud' :
							'normal'
					}
				>
					<Icon name="user" />
					<label>Profile</label>
				</Button>
			</li>
			<li>
				<Button
					href={statsUrl}
					onClick={props.onViewStats}
					style={props.selectedScreen.key === ScreenKey.Stats ? 'loud' : 'normal'}
				>
					<Icon name="line-chart" />
					<label>Stats</label>
				</Button>
			</li>
			<li>
				<Button
					href={leaderboardsUrl}
					onClick={props.onViewLeaderboards}
					style={props.selectedScreen.key === ScreenKey.Leaderboards ? 'loud' : 'normal'}
				>
					<Icon name="podium" />
					<label>Leaderboards</label>
				</Button>
			</li>
		</ol>
		<Footer onViewPrivacyPolicy={props.onViewPrivacyPolicy} />
	</div>
);