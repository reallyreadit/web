import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserStats from '../../../../common/models/UserStats';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import AsyncTracker from '../../../../common/AsyncTracker';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, SharedState } from '../Root';
import Leaderboards from '../../../../common/models/Leaderboards';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import RouteLocation from '../../../../common/routing/RouteLocation';

interface Props {
	onGetLeaderboards: FetchFunction<Leaderboards>,
	onGetStats: FetchFunction<UserStats | null>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	user: UserAccount | null
}
class BrowserLeaderboardsScreen extends React.Component<Props, {
	leaderboards: Fetchable<Leaderboards>,
	stats: Fetchable<UserStats | null>
}> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(this._asyncTracker.addCallback(leaderboards => { this.setState({ leaderboards }) })),
			stats: props.user ?
				props.onGetStats(this._asyncTracker.addCallback(stats => { this.setState({ stats }) })) :
				{ isLoading: false }
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (event.isCompletionCommit) {
					props.onGetStats(this._asyncTracker.addCallback(stats => { this.setState({ stats }); }));
					props.onGetLeaderboards(this._asyncTracker.addCallback(leaderboards => { this.setState({ leaderboards }); }));
				}
			}),
			props.onRegisterUserChangeHandler(user => {
				if (user) {
					this.setState({
						stats: props.onGetStats(this._asyncTracker.addCallback(stats => { this.setState({ stats }); }))
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
		create: (location: RouteLocation) => ({ key, location, title: 'Leaderboards' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<BrowserLeaderboardsScreen {...{ ...deps, user: sharedState.user }} />
		)
	};
}