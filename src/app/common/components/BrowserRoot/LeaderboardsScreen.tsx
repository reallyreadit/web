import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserWeeklyReadingStats from '../../../../common/models/UserWeeklyReadingStats';
import WeeklyReadingLeaderboards from '../../../../common/models/WeeklyReadingLeaderboards';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import EventHandlerStore from '../../EventHandlerStore';
import CallbackStore from '../../CallbackStore';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';

interface Props {
	onGetLeaderboards: FetchFunction<WeeklyReadingLeaderboards>,
	onGetStats: FetchFunction<UserWeeklyReadingStats | null>,
	onGetUser: () => UserAccount | null,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
}
class BrowserLeaderboardsScreen extends React.Component<Props, {
	leaderboards: Fetchable<WeeklyReadingLeaderboards>,
	stats: Fetchable<UserWeeklyReadingStats | null>
}> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(this._callbacks.add(leaderboards => { this.setState({ leaderboards }) })),
			stats: props.onGetUser() ?
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
				leaderboards={this.state.leaderboards}
				onGetUser={this.props.onGetUser}
				stats={this.state.stats}
			/>
		);
	}
}
export default function<TScreenKey>(key: TScreenKey, deps: Props) {
	return {
		create: () => ({ key, title: 'Leaderboards' }),
		render: () => (
			<BrowserLeaderboardsScreen {...deps} />
		)
	};
}