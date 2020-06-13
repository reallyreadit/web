import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import ScreenContainer from '../ScreenContainer';
import Dialog from '../../../../common/components/Dialog';
import { FetchFunction } from '../../serverApi/ServerApi';
import Leaderboards from '../../../../common/models/Leaderboards';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ReaderLeaderboards from './LeaderboardScreen/ReaderLeaderboards';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';

interface Props {
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetLeaderboards: FetchFunction<Leaderboards>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onViewProfile: (userName: string) => void,
	user: UserAccount
}
class LeaderboardsScreen extends React.Component<Props> {
	private readonly _openExplainer = (title: string, content: React.ReactNode) => {
		this.props.onOpenDialog(
			<Dialog
				closeButtonText="Ok"
				onClose={this.props.onCloseDialog}
				size="small"
				title={title}
			>
				{content}
			</Dialog>
		);
	};
	public render() {
		return (
			<ScreenContainer className="leaderboards-screen_wuzsob">
				<ReaderLeaderboards
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onGetLeaderboards={this.props.onGetLeaderboards}
					onOpenExplainer={this._openExplainer}
					onRegisterArticleChangeHandler={this.props.onRegisterArticleChangeHandler}
					onViewProfile={this.props.onViewProfile}
					user={this.props.user}
				/>
			</ScreenContainer>
		);
	}
}
export default function createLeaderboardsScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Leaderboards'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<LeaderboardsScreen
				onCloseDialog={services.onCloseDialog}
				onCreateAbsoluteUrl={services.onCreateAbsoluteUrl}
				onGetLeaderboards={services.onGetLeaderboards}
				onOpenDialog={services.onOpenDialog}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onViewProfile={services.onViewProfile}
				user={sharedState.user}
			/>
		)
	};
}