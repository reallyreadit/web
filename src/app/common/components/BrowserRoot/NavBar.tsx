import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from './Button';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';

export default (props: {
	onViewHistory: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewStarred: () => void,
	selectedScreenKey: ScreenKey
}) => (
	<ol className="nav-bar_yh8orf">
		<li>
			<Button
				href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
				onClick={props.onViewHome}
				style={props.selectedScreenKey === ScreenKey.Home ? 'loud' : 'normal'}
			>
				<Icon name="books" />
				<label>Home</label>
			</Button>
		</li>
		<li>
			<Button
				href={findRouteByKey(routes, ScreenKey.Starred).createUrl()}
				onClick={props.onViewStarred}
				style={props.selectedScreenKey === ScreenKey.Starred ? 'loud' : 'normal'}
			>
				<Icon name="star" />
				<label>Starred</label>
			</Button>
		</li>
		<li>
			<Button
				href={findRouteByKey(routes, ScreenKey.History).createUrl()}
				onClick={props.onViewHistory}
				style={props.selectedScreenKey === ScreenKey.History ? 'loud' : 'normal'}
			>
				<Icon name="history" />
				<label>History</label>
			</Button>
		</li>
		<li>
			<Button
				href={findRouteByKey(routes, ScreenKey.Leaderboards).createUrl()}
				onClick={props.onViewLeaderboards}
				style={props.selectedScreenKey === ScreenKey.Leaderboards ? 'loud' : 'normal'}
			>
				<Icon name="podium" />
				<label>Leaderboards</label>
			</Button>
		</li>
		<li>
			<Button
				href={findRouteByKey(routes, ScreenKey.Leaderboards).createUrl()}
				onClick={props.onViewLeaderboards}
				style={props.selectedScreenKey === ScreenKey.Leaderboards ? 'loud' : 'normal'}
			>
				<Icon name="pizza" />
				<label>Pizza Challenge</label>
			</Button>
		</li>
	</ol>
);