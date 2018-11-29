import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserStats from '../../../../common/models/UserStats';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import EventHandlerStore from '../../EventHandlerStore';
import CallbackStore from '../../CallbackStore';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, RootState } from '../Root';
import Leaderboards from '../../../../common/models/Leaderboards';
import UserArticle from '../../../../common/models/UserArticle';

interface Props {
	onGetLeaderboards: FetchFunction<Leaderboards>,
	onGetStats: FetchFunction<UserStats | null>,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle, isCompletionCommit: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	user: UserAccount | null
}
class BrowserLeaderboardsScreen extends React.Component<Props, {
	leaderboards: Fetchable<Leaderboards>,
	stats: Fetchable<UserStats | null>
}> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(this._callbacks.add(leaderboards => { this.setState({ leaderboards }) })),
			stats: props.user ?
				props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }) })) :
				{ isLoading: false }
		};
		this._eventHandlers.add(
			props.onRegisterArticleChangeHandler((article, isCompletionCommit) => {
				if (isCompletionCommit) {
					props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }); }));
					props.onGetLeaderboards(this._callbacks.add(leaderboards => { this.setState({ leaderboards }); }));
				}
			}),
			props.onRegisterUserChangeHandler(user => {
				if (user) {
					this.setState({
						stats: props.onGetStats(this._callbacks.add(stats => { this.setState({ stats }); }))
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