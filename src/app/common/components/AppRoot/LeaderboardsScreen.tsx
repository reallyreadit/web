import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserStats from '../../../../common/models/UserStats';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CallbackStore from '../../CallbackStore';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, RootState } from '../Root';
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
	private readonly _callbacks = new CallbackStore();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(this._callbacks.add(leaderboards => { this.setState({ leaderboards }) })),
			stats: props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }) }))
		};
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
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
		render: (screenState: Screen, rootState: RootState) => (
			<AppLeaderboardsScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}