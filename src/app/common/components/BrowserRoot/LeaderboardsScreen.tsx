import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserReadStats from '../../../../common/models/UserReadStats';
import ReadingLeaderboardRow from '../../../../common/models/ReadingLeaderboardRow';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import EventHandlerStore from '../../EventHandlerStore';
import CallbackStore from '../../CallbackStore';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, RootState } from '../Root';

interface Props {
	onGetLeaderboard: FetchFunction<ReadingLeaderboardRow[]>,
	onGetStats: FetchFunction<UserReadStats | null>,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	user: UserAccount | null
}
class BrowserLeaderboardsScreen extends React.Component<Props, {
	leaderboard: Fetchable<ReadingLeaderboardRow[]>,
	stats: Fetchable<UserReadStats | null>
}> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboard: props.onGetLeaderboard(this._callbacks.add(leaderboard => { this.setState({ leaderboard }) })),
			stats: props.user ?
				props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }) })) :
				{ isLoading: false }
		};
		this._eventHandlers.add(
			props.onRegisterUserChangeHandler(user => {
				if (user) {
					this.setState({
						stats: props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }) }))
					});
				} else {
					this.setState({
						stats: {
							isLoading: false
						}
					});
				}
			})
		);
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
		this._eventHandlers.unregister();
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
			<BrowserLeaderboardsScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}