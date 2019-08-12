import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';

export default (props: {
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyReads: () => void,
	onViewProfile: () => void,
	onViewStats: () => void,
	selectedScreenKey: ScreenKey
}) => (
	<ol className="nav-tray_2tc8">
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Home ? 'selected' : null}
				onClick={props.onViewHome}
			>
				<Icon name="books" />
				<label>Discover</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.MyReads ? 'selected' : null}
				onClick={props.onViewMyReads}
			>
				<Icon name="star" />
				<label>My Reads</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Profile ? 'selected' : null}
				onClick={props.onViewProfile}
			>
				<Icon name="user" />
				<label>Profile</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Stats ? 'selected' : null}
				onClick={props.onViewStats}
			>
				<Icon name="line-chart" />
				<label>Stats</label>
			</button>
		</li>
		<li>
			<button
				className={props.selectedScreenKey === ScreenKey.Leaderboards ? 'selected' : null}
				onClick={props.onViewLeaderboards}
			>
				<Icon name="podium" />
				<label>Leaderboards</label>
			</button>
		</li>
	</ol>
);