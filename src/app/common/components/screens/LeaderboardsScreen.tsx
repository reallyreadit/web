import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import ScreenContainer from '../ScreenContainer';
import Dialog from '../../../../common/components/Dialog';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import Leaderboards from '../../../../common/models/Leaderboards';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ReaderLeaderboards from './LeaderboardScreen/ReaderLeaderboards';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import AuthorLeaderboardsRequest from '../../../../common/models/stats/AuthorLeaderboardsRequest';
import AuthorRanking from '../../../../common/models/AuthorRanking';
import AuthorLeaderboardsTimeWindow from '../../../../common/models/stats/AuthorLeaderboardsTimeWindow';
import LoadingOverlay from '../controls/LoadingOverlay';
import HeaderSelector from '../HeaderSelector';
import AuthorLeaderboards from './LeaderboardScreen/AuthorLeaderboards';

interface Props {
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetAuthorLeaderboards: FetchFunctionWithParams<AuthorLeaderboardsRequest, AuthorRanking[]>,
	onGetReaderLeaderboards: FetchFunction<Leaderboards>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onViewAuthor: (slug: string, name: string) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount
}
enum View {
	Authors = 'Writers',
	Readers = 'Readers'
}
interface State {
	authorLeaderboards: Fetchable<AuthorRanking[]> | null,
	authorLeaderboardsTimeWindow: AuthorLeaderboardsTimeWindow,
	isScreenLoading: boolean,
	readerLeaderboards: Fetchable<Leaderboards> | null,
	view: View
}
class LeaderboardsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeAuthorLeaderboardsTimeWindow = (timeWindow: AuthorLeaderboardsTimeWindow) => {
		this.setState({
			authorLeaderboards: this.props.onGetAuthorLeaderboards(
				{
					timeWindow
				},
				this._asyncTracker.addCallback(
					authorLeaderboards => {
						this.setState({
							authorLeaderboards
						});
					}
				)
			),
			authorLeaderboardsTimeWindow: timeWindow
		});
	};
	private readonly _changeView = (value: string) => {
		const view = value as View;
		if (view === this.state.view) {
			return;
		}
		switch (view) {
			case View.Authors:
				this.setState({
					authorLeaderboards: this.props.onGetAuthorLeaderboards(
						{
							timeWindow: this.state.authorLeaderboardsTimeWindow
						},
						this._asyncTracker.addCallback(
							authorLeaderboards => {
								this.setState({
									authorLeaderboards
								});
							}
						)
					),
					readerLeaderboards: null,
					view
				});
				break;
			case View.Readers:
				this.setState({
					authorLeaderboards: null,
					authorLeaderboardsTimeWindow: AuthorLeaderboardsTimeWindow.PastWeek,
					readerLeaderboards: this.props.onGetReaderLeaderboards(
						this._asyncTracker.addCallback(
							readerLeaderboards => {
								this.setState({
									readerLeaderboards
								});
							}
						)
					),
					view
				});
				break;
		}
	};
	private readonly _headerSelectorItems = [
		{
			value: View.Authors
		},
		{
			value: View.Readers
		}
	];
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
	constructor(props: Props) {
		super(props);
		const
			authorLeaderboardsTimeWindow = AuthorLeaderboardsTimeWindow.PastWeek,
			authorLeaderboards = props.onGetAuthorLeaderboards(
				{
					timeWindow: authorLeaderboardsTimeWindow
				},
				this._asyncTracker.addCallback(
					authorLeaderboards => {
						this.setState({
							authorLeaderboards,
							isScreenLoading: false
						});
					}
				)
			);
		this.state = {
			authorLeaderboards,
			authorLeaderboardsTimeWindow,
			isScreenLoading: authorLeaderboards.isLoading,
			readerLeaderboards: null,
			view: View.Authors
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (!event.isCompletionCommit) {
						return;
					}
					switch (this.state.view) {
						case View.Authors:
							props.onGetAuthorLeaderboards(
								{
									timeWindow: this.state.authorLeaderboardsTimeWindow
								},
								this._asyncTracker.addCallback(
									authorLeaderboards => {
										this.setState({
											authorLeaderboards
										});
									}
								)
							);
							break;
						case View.Readers:
							props.onGetReaderLeaderboards(
								this._asyncTracker.addCallback(
									readerLeaderboards => {
										this.setState({
											readerLeaderboards
										});
									}
								)
							);
							break;
					}
				}
			)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="leaderboards-screen_wuzsob">
				{this.state.isScreenLoading ?
					<LoadingOverlay /> :
					<>
						<HeaderSelector
							disabled={
								this.state.authorLeaderboards?.isLoading ||
								this.state.readerLeaderboards?.isLoading
							}
							items={this._headerSelectorItems}
							onChange={this._changeView}
							value={this.state.view}
						/>
						{this.state.view === View.Authors ?
							<AuthorLeaderboards
								onChangeTimeWindow={this._changeAuthorLeaderboardsTimeWindow}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onOpenExplainer={this._openExplainer}
								onViewAuthor={this.props.onViewAuthor}
								rankings={this.state.authorLeaderboards}
								timeWindow={this.state.authorLeaderboardsTimeWindow}
							/> :
							<ReaderLeaderboards
								leaderboards={this.state.readerLeaderboards}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onOpenExplainer={this._openExplainer}
								onViewProfile={this.props.onViewProfile}
								user={this.props.user}
							/>}
					</>}
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
				onGetAuthorLeaderboards={services.onGetAuthorLeaderboards}
				onGetReaderLeaderboards={services.onGetReaderLeaderboards}
				onOpenDialog={services.onOpenDialog}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onViewAuthor={services.onViewAuthor}
				onViewProfile={services.onViewProfile}
				user={sharedState.user}
			/>
		)
	};
}