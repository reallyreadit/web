import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import FormDialog from '../../../../common/components/FormDialog';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import Leaderboards from '../../../../common/models/Leaderboards';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ReaderLeaderboards from './LeaderboardScreen/ReaderLeaderboards';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState, NavReference } from '../Root';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import HeaderSelector from '../HeaderSelector';
import AuthorLeaderboards from './LeaderboardScreen/AuthorLeaderboards';
import { DeviceType } from '../../../../common/DeviceType';
import { variants as marketingVariants } from '../../marketingTesting';
import Panel from '../BrowserRoot/Panel';
import GetStartedButton from '../BrowserRoot/GetStartedButton';
import { AuthorsEarningsReportResponse, AuthorsEarningsReportRequest } from '../../../../common/models/subscriptions/AuthorEarningsReport';

interface Props {
	deviceType: DeviceType,
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onGetAuthorsEarningsReport: FetchFunctionWithParams<AuthorsEarningsReportRequest, AuthorsEarningsReportResponse>,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onGetReaderLeaderboards: FetchFunction<Leaderboards>,
	onNavTo: (ref: NavReference) => void,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onViewAuthor: (slug: string, name: string) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}
enum View {
	Authors = 'Writers',
	Readers = 'Readers'
}
interface State {
	authorLeaderboards: Fetchable<AuthorsEarningsReportResponse> | null,
	authorLeaderboardsRequest: AuthorsEarningsReportRequest,
	isScreenLoading: boolean,
	readerLeaderboards: Fetchable<Leaderboards> | null,
	view: View
}
const defaultAuthorLeaderboardsRequest = {
	minAmountEarned: 1000,
	maxAmountEarned: 0
};
class LeaderboardsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeView = (value: string) => {
		const view = value as View;
		if (view === this.state.view) {
			return;
		}
		switch (view) {
			case View.Authors:
				this.setState({
					authorLeaderboards: this.props.onGetAuthorsEarningsReport(
						defaultAuthorLeaderboardsRequest,
						this._asyncTracker.addCallback(
							authorLeaderboards => {
								this.setState({
									authorLeaderboards
								});
							}
						)
					),
					authorLeaderboardsRequest: defaultAuthorLeaderboardsRequest,
					readerLeaderboards: null,
					view
				});
				break;
			case View.Readers:
				this.setState({
					authorLeaderboards: null,
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
			<FormDialog
				closeButtonText="Ok"
				onClose={this.props.onCloseDialog}
				size="small"
				title={title}
			>
				{content}
			</FormDialog>
		);
	};
	constructor(props: Props) {
		super(props);
		const
			authorLeaderboards = props.onGetAuthorsEarningsReport(
				defaultAuthorLeaderboardsRequest,
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
			authorLeaderboardsRequest: defaultAuthorLeaderboardsRequest,
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
							props.onGetAuthorsEarningsReport(
								this.state.authorLeaderboardsRequest,
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
	public componentDidUpdate(prevProps: Props) {
		if (
			(
				!this.props.user !== !prevProps.user
			) &&
			this.state.view === View.Readers
		) {
			this.setState({
				readerLeaderboards: this.props.onGetReaderLeaderboards(
					this._asyncTracker.addCallback(
						readerLeaderboards => {
							this.setState({
								readerLeaderboards
							});
						}
					)
				)
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const marketingVariant = marketingVariants[0];
		return (
			<div className="leaderboards-screen_wuzsob">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="absolute" /> :
					<>
						{!this.props.user ?
							<Panel className="header">
								<h1>{marketingVariant.headline}</h1>
								<h3>{marketingVariant.subtext}</h3>
								<div className="buttons">
									<GetStartedButton
										analyticsAction="LeaderboardsScreen"
										deviceType={this.props.deviceType}
										location={this.props.location}
										onBeginOnboarding={this.props.onBeginOnboarding}
										onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
										onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
										onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
									/>
								</div>
							</Panel> :
							null}
						<Panel className="main">
							{!this.props.user ?
								<h1>Leaderboards</h1> :
								null}
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
									onNavTo={this.props.onNavTo}
									response={this.state.authorLeaderboards}
								/> :
								<ReaderLeaderboards
									leaderboards={this.state.readerLeaderboards}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onOpenExplainer={this._openExplainer}
									onViewProfile={this.props.onViewProfile}
									user={this.props.user}
								/>}
						</Panel>
					</>}
			</div>
		);
	}
}
export default function createLeaderboardsScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<Props, Exclude<keyof Props, 'location' | 'user'>>
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
				deviceType={services.deviceType}
				location={screen.location}
				onBeginOnboarding={services.onBeginOnboarding}
				onCopyAppReferrerTextToClipboard={services.onCopyAppReferrerTextToClipboard}
				onCloseDialog={services.onCloseDialog}
				onCreateAbsoluteUrl={services.onCreateAbsoluteUrl}
				onCreateStaticContentUrl={services.onCreateStaticContentUrl}
				onGetAuthorsEarningsReport={services.onGetAuthorsEarningsReport}
				onOpenNewPlatformNotificationRequestDialog={services.onOpenNewPlatformNotificationRequestDialog}
				onGetReaderLeaderboards={services.onGetReaderLeaderboards}
				onNavTo={services.onNavTo}
				onOpenDialog={services.onOpenDialog}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onViewAuthor={services.onViewAuthor}
				onViewProfile={services.onViewProfile}
				user={sharedState.user}
			/>
		)
	};
}