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
	myFeedUrl = findRouteByKey(routes, ScreenKey.MyFeed).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl(),
	profileRoute = findRouteByKey(routes, ScreenKey.Profile),
	leaderboardsUrl = findRouteByKey(routes, ScreenKey.Leaderboards).createUrl();

export default (props: {
	onViewBlog: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyFeed: () => void,
	onViewMyReads: () => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: () => void,
	selectedScreen: Screen,
	user: UserAccount
}) => (
	<div className="nav-bar_yh8orf">
		<ol>
			<li>
				<Button
					badge={hasAlert(props.user, Alert.Aotd) ? 1 : 0}
					href={homeUrl}
					onClick={props.onViewHome}
					state={props.selectedScreen.key === ScreenKey.Home ? 'selected' : 'normal'}
					iconLeft="trophy"
					text="AOTD"
					size="x-large"
					display="block"
				/>
			</li>
			<li>
				<Button
					badge={props.user.postAlertCount}
					href={myFeedUrl}
					onClick={props.onViewMyFeed}
					state={props.selectedScreen.key === ScreenKey.MyFeed ? 'selected' : 'normal'}
					iconLeft="group-circle"
					text="My Feed"
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
		<div className="download-app">
			<a href="https://apps.apple.com/us/app/readup-app/id1441825432" target="_blank">
				<span>Download the Readup iOS App</span>
				<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
			</a>
		</div>
		<Footer
			onViewBlog={props.onViewBlog}
			onViewPrivacyPolicy={props.onViewPrivacyPolicy}
		/>
	</div>
);