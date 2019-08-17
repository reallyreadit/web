import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import UserAccount from '../../../../common/models/UserAccount';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import { Screen } from '../Root';

const profileRoute = findRouteByKey(routes, ScreenKey.Profile);

export default (props: {
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyReads: () => void,
	onViewProfile: () => void,
	onViewStats: () => void,
	selectedScreen: Screen,
	user: UserAccount
}) => (
	<ol className="nav-tray_2tc8">
		<li>
			<button
				className={props.selectedScreen.key === ScreenKey.Home ? 'selected' : null}
				onClick={props.onViewHome}
			>
				<Icon name="earth" />
				<label>Discover</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreen.key === ScreenKey.MyReads ? 'selected' : null}
				onClick={props.onViewMyReads}
			>
				<Icon name="star" />
				<label>My Reads</label>
			</button>
		</li>
		<li>
			<button
				className={
					(
						props.selectedScreen.key === ScreenKey.Profile &&
						profileRoute.getPathParams(props.selectedScreen.location.path)['userName'].toLowerCase() === props.user.name.toLowerCase()
					) ?
						'selected' :
						null
				}
				onClick={props.onViewProfile}
			>
				<Icon name="user" />
				<label>Profile</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreen.key === ScreenKey.Stats ? 'selected' : null}
				onClick={props.onViewStats}
			>
				<Icon name="line-chart" />
				<label>Stats</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreen.key === ScreenKey.Leaderboards ? 'selected' : null}
				onClick={props.onViewLeaderboards}
			>
				<Icon name="podium" />
				<label>Leaderboards</label>
			</button>
		</li>
	</ol>
);