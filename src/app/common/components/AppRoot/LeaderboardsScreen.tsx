import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserStats from '../../../../common/models/UserStats';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import AsyncTracker from '../../../../common/AsyncTracker';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, SharedState } from '../Root';
import Leaderboards from '../../../../common/models/Leaderboards';

interface Props {
	onGetLeaderboards: FetchFunction<Leaderboards>,
	onGetStats: FetchFunction<UserStats | null>,
	user: UserAccount | null
}
class AppLeaderboardsScreen extends React.Component<Props, {
	leaderboards: Fetchable<Leaderboards>,
	stats: Fetchable<UserStats | null>
}> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(this._asyncTracker.addCallback(leaderboards => { this.setState({ leaderboards }) })),
			stats: props.onGetStats(this._asyncTracker.addCallback(stats => { this.setState({ stats }) }))
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<LeaderboardsScreen
				leaderboards={this.state.leaderboards}
				stats={this.state.stats}
				user={this.props.user}
			/>
		);
	}
}
export default function<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: () => ({ key, title: 'Leaderboards' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<AppLeaderboardsScreen {...{ ...deps, user: sharedState.user }} />
		)
	};
}