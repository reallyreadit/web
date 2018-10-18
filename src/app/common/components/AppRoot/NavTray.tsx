import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';

export default (props: {
	onViewHistory: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewStarred: () => void,
	selectedScreenKey: ScreenKey
}) => (
	<ol className="nav-tray_2tc8">
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Home ? 'selected' : null}
				onClick={props.onViewHome}
			>
				<Icon name="home" />
				<label>Home</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Starred ? 'selected' : null}
				onClick={props.onViewStarred}
			>
				<Icon name="star" />
				<label>Starred</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.History ? 'selected' : null}
				onClick={props.onViewHistory}
			>
				<Icon name="clock" />
				<label>History</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Leaderboards ? 'selected' : null}
				onClick={props.onViewLeaderboards}
			>
				<Icon name="line-chart" />
				<label>Leaderboards</label>
			</button>
		</li>
	</ol>
);