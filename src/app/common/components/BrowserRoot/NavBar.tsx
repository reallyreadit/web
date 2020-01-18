import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Footer from './Footer';
import UserAccount, { hasAlert } from '../../../../common/models/UserAccount';
import { Screen } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';

const
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl(),
	profileRoute = findRouteByKey(routes, ScreenKey.Profile),
	statsUrl = findRouteByKey(routes, ScreenKey.Stats).createUrl(),
	leaderboardsUrl = findRouteByKey(routes, ScreenKey.Leaderboards).createUrl();

export default (props: {
	onViewBlog: () => void,
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
					badge={props.user.postAlertCount + (hasAlert(props.user, Alert.Aotd) ? 1 : 0)}
					href={homeUrl}
					onClick={props.onViewHome}
					state={props.selectedScreen.key === ScreenKey.Home ? 'selected' : 'normal'}
					iconLeft="earth"
					text="Discover"
					size="x-large"
					display="block"
				/>
			</li>
			<li>
				<Button
					href={myReadsUrl}
					onClick={props.onViewMyReads}
					state={props.selectedScreen.key === ScreenKey.MyReads ? 'selected' : 'normal'}
					iconLeft="star"
					text="My Reads"
					size="x-large"
					display="block"
				/>
			</li>
			<li>
				<Button
					badge={props.user.followerAlertCount}
					href={profileRoute.createUrl({ userName: props.user.name })}
					onClick={props.onViewProfile}
					state={
						(
							props.selectedScreen.key === ScreenKey.Profile &&
							profileRoute.getPathParams(props.selectedScreen.location.path)['userName'].toLowerCase() === props.user.name.toLowerCase()
						) ?
							'selected' :
							'normal'
					}
					iconLeft="user"
					text="Profile"
					size="x-large"
					display="block"
				/>
			</li>
			<li>
				<Button
					href={statsUrl}
					onClick={props.onViewStats}
					state={props.selectedScreen.key === ScreenKey.Stats ? 'selected' : 'normal'}
					iconLeft="line-chart"
					text="Stats"
					size="x-large"
					display="block"
				/>
			</li>
			<li>
				<Button
					href={leaderboardsUrl}
					onClick={props.onViewLeaderboards}
					state={props.selectedScreen.key === ScreenKey.Leaderboards ? 'selected' : 'normal'}
					iconLeft="podium"
					text="Leaderboards"
					size="x-large"
					display="block"
				/>
			</li>
		</ol>
		<Footer
			onViewBlog={props.onViewBlog}
			onViewPrivacyPolicy={props.onViewPrivacyPolicy}
		/>
	</div>
);