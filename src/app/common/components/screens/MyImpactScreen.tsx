import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SubscriptionDistributionReport } from '../../../../common/models/subscriptions/SubscriptionDistributionReport';
import { FetchFunction } from '../../serverApi/ServerApi';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import DistributionChart, { ReportType } from './MyImpactScreen/DistributionChart';
import { formatSubscriptionPriceAmount, formatSubscriptionPriceName, SubscriptionPriceLevel } from '../../../../common/models/subscriptions/SubscriptionPrice';
import { formatCountable, formatIsoDateAsUtc, formatCurrency } from '../../../../common/format';
import { DateTime } from 'luxon';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { SubscriptionDistributionSummaryResponse } from '../../../../common/models/subscriptions/SubscriptionDistributionSummaryResponse';
import { SubscriptionStatusType, ActiveSubscriptionStatus, SubscriptionStatus } from '../../../../common/models/subscriptions/SubscriptionStatus';
import Button from '../../../../common/components/Button';
import HeaderSelector from '../HeaderSelector';
import * as classNames from 'classnames';
import { Screen, SharedState } from '../Root';
import UserArticle from '../../../../common/models/UserArticle';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import Link from '../../../../common/components/Link';

function renderCountdown(status: ActiveSubscriptionStatus, dist: SubscriptionDistributionReport) {
	const daysRemaining = Math.ceil(
			DateTime
				.utc()
				.until(
					DateTime.fromISO(
						formatIsoDateAsUtc(status.currentPeriodRenewalGracePeriodEndDate)
					)
				)
				.length('days')
		);
	if (dist.authorDistributions.length) {
		return (
			<div className="content-block">{daysRemaining} {formatCountable(daysRemaining, 'day')} until your first month's payments are finalized and processed. Keep reading!</div>
		);
	}
	return (
		<div className="content-block">{daysRemaining} {formatCountable(daysRemaining, 'day')} until your current cycle ends.</div>
	);
}
function renderSubscriptionDetails(price: SubscriptionPriceLevel) {
	return (
		<div className="content-block">
			{formatSubscriptionPriceName(price)}<br />
			{formatSubscriptionPriceAmount(price)} / month
		</div>
	);
}



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

interface Props {
	onCreateStaticContentUrl: (path: string) => string,
	onGetSubscriptionDistributionSummary: FetchFunction<SubscriptionDistributionSummaryResponse>,
	onOpenPaymentConfirmationDialog: (invoiceId: string) => void,
	onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onViewAuthor: (slug: string, name: string) => void,
	subscriptionStatus: SubscriptionStatus
}
interface State {
	hasChangedReportType: boolean,
	selectedReportType: ReportType,
	summary: Fetchable<Pick<SubscriptionDistributionSummaryResponse, Exclude<keyof SubscriptionDistributionSummaryResponse, 'subscriptionStatus'>>>
}
class MyImpactScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _openPaymentConfirmationDialog = () => {
		if (this.props.subscriptionStatus.type === SubscriptionStatusType.PaymentConfirmationRequired) {
			this.props.onOpenPaymentConfirmationDialog(this.props.subscriptionStatus.invoiceId);
		}
	};
	private readonly _openSubscriptionPromptDialog = () => {
		this.props.onOpenSubscriptionPromptDialog();
	};
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
			summary: this.fetchData()
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
	private fetchData() {
		return this.props.onGetSubscriptionDistributionSummary(
			this._asyncTracker.addCallback(
				summary => {
					this.setState({
						summary
					});
				}
			)
		);
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
		switch (this.props.subscriptionStatus.type) {
			case SubscriptionStatusType.NeverSubscribed:
			case SubscriptionStatusType.PaymentFailed:
				return (
					<>
						<div className="content-block title">
							{this.props.subscriptionStatus.isUserFreeForLife ?
								'Buy a subscription. Watch your money go to the writers you read.' :
								'Subscribe to start reading. Watch your money go to the writers you read.'}
						</div>
						<div className="spacer"></div>
						<img src={this.props.onCreateStaticContentUrl('/app/images/home/watch-money.png')} alt="My Impact illustration." />
						<div className="spacer"></div>
						<div className="content-block title">Pay what you want.</div>
						<div className="spacer"></div>
						<div className="content-block">
							<Button
								intent="primary"
								onClick={this._openSubscriptionPromptDialog}
								size="large"
								text="Pick your price"
							/>
						</div>
					</>
				);
			case SubscriptionStatusType.PaymentConfirmationRequired:
				return (
					<>
						{this.renderViewToggle()}
						<div className="content-block title">Subscription Incomplete</div>
						<div className="spacer"></div>
						{renderSubscriptionDetails(this.props.subscriptionStatus.price)}
						<div className="spacer"></div>
						<div className="content-block">Payment confirmation required.</div>
						<div className="spacer"></div>
						<div className="content-block">
							<Button
								intent="loud"
								onClick={this._openPaymentConfirmationDialog}
								size="large"
								text="Confirm Payment"
							/>
						</div>
						<div className="spacer"></div>
						<div className="content-block">
							<Link
								onClick={this._openSubscriptionPromptDialog}
								text="Start New Subscription"
							/>
						</div>
					</>
				);
			case SubscriptionStatusType.Active:
				return (
					<>
						{this.renderViewToggle()}
						<div className="content-block title">Monthly contribution: {formatSubscriptionPriceAmount(this.props.subscriptionStatus.price)}</div>
						<div className="spacer"></div>
						<DistributionChart
							report={summary.currentPeriod}
							reportType={this.state.selectedReportType}
							onViewAuthor={this.props.onViewAuthor}
						/>
						<div className="spacer"></div>
						{renderCountdown(this.props.subscriptionStatus, summary.currentPeriod)}
					</>
				);
			case SubscriptionStatusType.Lapsed:
				return (
					<>
						{this.renderViewToggle()}
						<div className="content-block title">Subscription Inactive</div>
						<div className="spacer"></div>
						{renderSubscriptionDetails(this.props.subscriptionStatus.price)}
						<div className="spacer"></div>
						<div className="content-block">
							{this.props.subscriptionStatus.lastPeriodDateRefunded ?
								`Refunded on ${DateTime.fromISO(formatIsoDateAsUtc(this.props.subscriptionStatus.lastPeriodDateRefunded)).toLocaleString(DateTime.DATE_MED)}.` :
								`Ended on ${DateTime.fromISO(formatIsoDateAsUtc(this.props.subscriptionStatus.lastPeriodRenewalGracePeriodEndDate)).toLocaleString(DateTime.DATE_MED)}.`}
						</div>
						<div className="spacer"></div>
						<div className="content-block">
							<Button
								intent="loud"
								onClick={this._openSubscriptionPromptDialog}
								size="large"
								text="See Options"
							/>
						</div>
					</>
				);
		}
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
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'My Impact'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<MyImpactScreen
				onCreateStaticContentUrl={deps.onCreateStaticContentUrl}
				onGetSubscriptionDistributionSummary={deps.onGetSubscriptionDistributionSummary}
				onOpenPaymentConfirmationDialog={deps.onOpenPaymentConfirmationDialog}
				onOpenSubscriptionPromptDialog={deps.onOpenSubscriptionPromptDialog}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onViewAuthor={deps.onViewAuthor}
				subscriptionStatus={sharedState.subscriptionStatus}
			/>
		)
	};
}