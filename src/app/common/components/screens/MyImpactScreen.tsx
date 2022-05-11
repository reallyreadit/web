import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import DistributionChart, { ReportType } from './MyImpactScreen/DistributionChart';
import { formatCurrency } from '../../../../common/format';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { SubscriptionDistributionSummaryResponse } from '../../../../common/models/subscriptions/SubscriptionDistributionSummaryResponse';
import { SubscriptionStatusType, SubscriptionStatus } from '../../../../common/models/subscriptions/SubscriptionStatus';
import HeaderSelector from '../HeaderSelector';
import * as classNames from 'classnames';
import { NavOptions, NavReference, Screen, SharedState } from '../Root';
import UserArticle from '../../../../common/models/UserArticle';
import {FreeTrialPromoTweetIntentRegistrationRequest, FreeTrialPromoTweetIntentRegistrationResponse} from '../../../../common/models/subscriptions/FreeTrialPromoTweetIntent';
import {TweetWebIntentParams} from '../../../../common/sharing/twitter';
import {Intent} from '../../../../common/components/Toaster';
import PageResult from '../../../../common/models/PageResult';

const headerSelectorItems = [
	{
		reportType: ReportType.CurrentPeriod,
		value: 'Current Cycle'
	},
	{
		reportType: ReportType.CompletedPeriods,
		value: 'All Time'
	}
];

type ArticleFetchFunction = FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>;
interface Props {
	onCreateStaticContentUrl: (path: string) => string,
	onGetSubscriptionDistributionSummary: FetchFunction<SubscriptionDistributionSummaryResponse>,
	onGetUserArticleHistory: ArticleFetchFunction,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onOpenTweetComposerWithCompletionHandler: (params: TweetWebIntentParams) => Promise<void>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterFreeTrialPromoTweetIntent: (request: FreeTrialPromoTweetIntentRegistrationRequest) => Promise<FreeTrialPromoTweetIntentRegistrationResponse>
	onShowToast: (content: React.ReactNode, intent: Intent, remove?: boolean) => void,
	onViewAuthor: (slug: string, name: string) => void,
	subscriptionStatus: SubscriptionStatus
}
interface State {
	hasChangedReportType: boolean,
	selectedReportType: ReportType,
	summary: Fetchable<Pick<SubscriptionDistributionSummaryResponse, Exclude<keyof SubscriptionDistributionSummaryResponse, 'subscriptionStatus'>>>,
	userArticleHistory: Fetchable<PageResult<UserArticle>>, // used to calculate free reads read to completion
	isTweeting: boolean,
}
class MyImpactScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();

	private readonly _selectReportType = (value: string) => {
		this.setState({
			hasChangedReportType: true,
			selectedReportType: headerSelectorItems
				.find(
					item => item.value === value
				)
				.reportType
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hasChangedReportType: false,
			selectedReportType: ReportType.CurrentPeriod,
			isTweeting: false,
			...this.fetchData()
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (event.isCompletionCommit) {
						this.fetchData();
					}
				}
			)
		);
	}
	private fetchData(): {
		summary: Fetchable<Pick<SubscriptionDistributionSummaryResponse, Exclude<keyof SubscriptionDistributionSummaryResponse, 'subscriptionStatus'>>>,
		userArticleHistory: Fetchable<PageResult<UserArticle>>, // used to calculate free reads read to completion
	} {
		return {
			summary: this.props.onGetSubscriptionDistributionSummary(
				this._asyncTracker.addCallback(
					summary => {
						this.setState({
							summary
						});
					}
				)
			),
			// assumption: all free views will fit in 1 page
			userArticleHistory: this.props.onGetUserArticleHistory({pageNumber: 1},
				this._asyncTracker.addCallback(
					userArticleHistory => {
						this.setState({
							userArticleHistory
						})
					}
				)
			)
		}
	}

	private renderContent() {
		if (this.state.summary.isLoading) {
			return (
				<LoadingOverlay position="absolute" />
			);
		}
		const summary = this.state.summary.value;
		if (this.state.selectedReportType === ReportType.CompletedPeriods) {
			return (
				<>
					{this.renderViewToggle()}
					<div className="content-block title">Total contributions: {formatCurrency(summary.completedPeriods.subscriptionAmount)}</div>
					<div className="spacer"></div>
					<DistributionChart
						report={summary.completedPeriods}
						reportType={this.state.selectedReportType}
						onViewAuthor={this.props.onViewAuthor}
					/>
				</>
			);
		}

		return (
			<>
				{this.renderViewToggle()}
				<div className="spacer"></div>
				<DistributionChart
					report={summary.currentPeriod}
					reportType={this.state.selectedReportType}
					onViewAuthor={this.props.onViewAuthor}
				/>
			</>
		);
	}
	private renderViewToggle() {
		if (
			!this.state.summary.value ||
			this.state.summary.value.completedPeriods.subscriptionAmount === 0
		) {
			return null;
		}
		return (
			<>
				<div className="content-block toggle">
					<HeaderSelector
						items={headerSelectorItems}
						onChange={this._selectReportType}
						style="compact"
						value={
							headerSelectorItems
								.find(
									item => item.reportType === this.state.selectedReportType
								)
								.value
						}
					/>
				</div>
				<div className="spacer"></div>
			</>
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className={
				classNames(
					'my-impact-screen_n8wfkf',
					{
						'fade-in':
							!this.state.hasChangedReportType &&
							this.state.summary.value &&
							this.props.subscriptionStatus.type === SubscriptionStatusType.Active
					}
				)
			}>
				{this.renderContent()}
			</ScreenContainer>
		);
	}
}
export function createMyImpactScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'subscriptionStatus'>>
) {
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => ({
			id,
			key,
			location,
			title: 'Author Distribution'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<MyImpactScreen
				onCreateStaticContentUrl={deps.onCreateStaticContentUrl}
				onGetSubscriptionDistributionSummary={deps.onGetSubscriptionDistributionSummary}
				onGetUserArticleHistory={deps.onGetUserArticleHistory}
				onNavTo={deps.onNavTo}
				onOpenTweetComposerWithCompletionHandler={deps.onOpenTweetComposerWithCompletionHandler}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onRegisterFreeTrialPromoTweetIntent={deps.onRegisterFreeTrialPromoTweetIntent}
				onShowToast={deps.onShowToast}
				onViewAuthor={deps.onViewAuthor}
				subscriptionStatus={sharedState.subscriptionStatus}
			/>
		)
	};
}