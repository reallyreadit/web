import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserReadStats from '../../../../common/models/UserReadStats';
import ReadingLeaderboardRow from '../../../../common/models/ReadingLeaderboardRow';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CallbackStore from '../../CallbackStore';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, RootState } from '../Root';

interface Props {
	onGetLeaderboard: FetchFunction<ReadingLeaderboardRow[]>,
	onGetStats: FetchFunction<UserReadStats | null>,
	user: UserAccount | null
}
class AppLeaderboardsScreen extends React.Component<Props, {
	leaderboard: Fetchable<ReadingLeaderboardRow[]>,
	stats: Fetchable<UserReadStats | null>
}> {
	private readonly _callbacks = new CallbackStore();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboard: props.onGetLeaderboard(this._callbacks.add(leaderboard => { this.setState({ leaderboard }) })),
			stats: props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }) }))
		};
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
	}
	public render() {
		return (
			<LeaderboardsScreen
				leaderboard={this.state.leaderboard}
				stats={this.state.stats}
				user={this.props.user}
			/>
		);
	}
}
export default function<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: () => ({ key, title: 'Leaderboards' }),
		render: (screenState: Screen, rootState: RootState) => (
			<AppLeaderboardsScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}