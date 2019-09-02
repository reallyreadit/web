import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunction } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import AsyncTracker from '../../../../common/AsyncTracker';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import { Screen, SharedState } from '../Root';
import Leaderboards from '../../../../common/models/Leaderboards';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import RouteLocation from '../../../../common/routing/RouteLocation';

interface Props {
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetLeaderboards: FetchFunction<Leaderboards>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}
class BrowserLeaderboardsScreen extends React.Component<Props, {
	leaderboards: Fetchable<Leaderboards>
}> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(this._asyncTracker.addCallback(leaderboards => { this.setState({ leaderboards }) }))
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (event.isCompletionCommit) {
					props.onGetLeaderboards(this._asyncTracker.addCallback(leaderboards => { this.setState({ leaderboards }); }));
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
				onCloseDialog={this.props.onCloseDialog}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onOpenDialog={this.props.onOpenDialog}
				onViewProfile={this.props.onViewProfile}
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