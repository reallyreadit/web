import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SubscriptionDistributionReport } from '../../../../common/models/subscriptions/SubscriptionDistributionReport';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import DistributionChart, { ReportType } from './MyImpactScreen/DistributionChart';
import { formatSubscriptionPriceAmount, formatSubscriptionPriceName, SubscriptionPriceLevel } from '../../../../common/models/subscriptions/SubscriptionPrice';
import { formatCountable, formatIsoDateAsUtc, formatCurrency } from '../../../../common/format';
import { DateTime } from 'luxon';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { SubscriptionDistributionSummaryResponse } from '../../../../common/models/subscriptions/SubscriptionDistributionSummaryResponse';
import { SubscriptionStatusType, ActiveSubscriptionStatus, SubscriptionStatus, calculateFreeViewBalance, isTrialingSubscription, calculateTotalFreeViewCredit, NeverSubscribedSubscriptionStatus, FreeTrial } from '../../../../common/models/subscriptions/SubscriptionStatus';
import Button from '../../../../common/components/Button';
import HeaderSelector from '../HeaderSelector';
import * as classNames from 'classnames';
import { NavMethod, NavOptions, NavReference, Screen, SharedState } from '../Root';
import UserArticle from '../../../../common/models/UserArticle';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import Link from '../../../../common/components/Link';
import ContentBox from '../../../../common/components/ContentBox';
import ScreenKey from '../../../../common/routing/ScreenKey';
import FreeTrialNotice, {findTweetPromoCredit} from '../AppRoot/FreeTrialNotice';
import {FreeTrialPromoTweetIntentRegistrationRequest, FreeTrialPromoTweetIntentRegistrationResponse} from '../../../../common/models/subscriptions/FreeTrialPromoTweetIntent';
import {TweetWebIntentParams} from '../../../../common/sharing/twitter';
import {Intent} from '../../../../common/components/Toaster';
import PageResult from '../../../../common/models/PageResult';
import SpinnerIcon from '../../../../common/components/SpinnerIcon';
import SubscribePitchElement from '../AppRoot/SubscribePitchElement';

function calculateFreeReadsToCompletion (freeTrial: FreeTrial, readingHistory: UserArticle[]) {
	return freeTrial.articleViews
		.filter(
			freeArticle => readingHistory.some(
				historyArticle => historyArticle.slug === freeArticle.articleSlug && historyArticle.isRead
			)
		)
		.length;
}
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

type ArticleFetchFunction = FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>;
interface Props {
	onCreateStaticContentUrl: (path: string) => string,
	onGetSubscriptionDistributionSummary: FetchFunction<SubscriptionDistributionSummaryResponse>,
	onGetUserArticleHistory: ArticleFetchFunction,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onOpenPaymentConfirmationDialog: (invoiceId: string) => void,
	onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
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
	private readonly _openPaymentConfirmationDialog = () => {
		if (this.props.subscriptionStatus.type === SubscriptionStatusType.PaymentConfirmationRequired) {
			this.props.onOpenPaymentConfirmationDialog(this.props.subscriptionStatus.invoiceId);
		}
	};
	private readonly _openSubscriptionPromptDialog = () => {
		this.props.onOpenSubscriptionPromptDialog();
	};

	private readonly _openTweetComposer = () => {
		// Tweeting in this context is modal. Guard against duplicate events by using the callback form of setState so that we can
		// safely check the current state before proceeding.
		this.setState(
			prevState => {
				// Cancel the whole operation if we're already Tweeting.
				if (prevState.isTweeting) {
					return null;
				}
				this._asyncTracker
					// We're going to want to call setState after this promise resolves so make it cancellable by adding it to the AsyncTracker instance.
					// The user might navigate away from this screen before the Tweet completion handler resolves.
					// Calling setState on an unmounted component is an error in React.
					.addPromise(
						this.props.onOpenTweetComposerWithCompletionHandler({
							text: "I just finished some articles on Readup, check it out! ",
							url: "https://readup.com",
							via: 'ReadupDotCom'
						})
					)
					.then(
						() => {
							// Only register the promo Tweet for non-free-for-life users.
							if (this.props.subscriptionStatus.isUserFreeForLife) {
								this.props.onShowToast('Thanks for tweeting!', Intent.Success);
								return Promise.resolve();
							} else {
								// Promo Tweet registration is another async request that should be cancellable.
								return this._asyncTracker
									.addPromise(
										this.props.onRegisterFreeTrialPromoTweetIntent({})
									)
									.then(
										res => {
											const tweetPromoCredit = isTrialingSubscription(res.subscriptionStatus) && findTweetPromoCredit(res.subscriptionStatus.freeTrial);
											if (tweetPromoCredit) {
												// The promo Tweet credit could yield any number of free articles so we should use formatCountable to handle singular/plural forms.
												this.props.onShowToast(`You received ${tweetPromoCredit.amount} more free ${formatCountable(tweetPromoCredit.amount, 'article')}!`, Intent.Success);
											} else {
												// shouldn't happen!
												console.error("Couldn't find assigned requested tweet credit!")
											}
										}
									);
							}
						}
					)
					.then(
						() => {
							// Clear the modal Tweet state after a successful operation.
							this.setState({
								isTweeting: false
							});
						}
					)
					.catch(
						reason => {
							// If any of the promises were cancelled we should return immediately so that we don't call setState on an unmounted component.
							if ((reason as CancellationToken)?.isCancelled) {
								return;
							}
							// Otherwise we can clear the modal Tweet state and optionally show an error message here since something went wrong.
							this.setState({
								isTweeting: false
							});
						}
					);
				// Set the modal Tweet state.
				return {
					isTweeting: true
				};
			}
		);
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

	private _renderFreeTrialNotice() {
		if (isTrialingSubscription(this.props.subscriptionStatus) && calculateFreeViewBalance(this.props.subscriptionStatus.freeTrial) > 0) {
			return <FreeTrialNotice
				detailLevel='minimal'
				onOpenSubscriptionPromptDialog={this.props.onOpenSubscriptionPromptDialog}
				onNavTo={this.props.onNavTo}
				subscriptionStatus={this.props.subscriptionStatus}
			/>
		}
		return null;
	}

	/**
	 *
	 * @returns content rendered for a reader who has never subscribed
	 */
	private _renderNeverSubscribedContent(status: NeverSubscribedSubscriptionStatus) {
		let freeTrialInfo: React.ReactNode = null;
		if (status.isUserFreeForLife === false) {
			const viewsRemaining = calculateFreeViewBalance(status.freeTrial);
			const totalFreeViews = calculateTotalFreeViewCredit(status.freeTrial);
			const articleCompletions = calculateFreeReadsToCompletion(status.freeTrial, this.state.userArticleHistory?.value?.items ?? []);

			freeTrialInfo = (<ContentBox className="stats">
					<div className="metric views--remaining">{viewsRemaining} of {totalFreeViews} {formatCountable(viewsRemaining, 'article')} left</div>
					<div className="metric article-completions">
						{ this.state.userArticleHistory.isLoading ?
							<><SpinnerIcon/> loading</> :
							this.state.userArticleHistory.value ?
							<>{articleCompletions} {formatCountable(articleCompletions, 'article')} finished</>
							: null
						}
					</div>
					<Link onClick={() => this.props.onNavTo({
								key: ScreenKey.MyReads,
								params: {view: 'history'}
							}, {method: NavMethod.ReplaceAll}
							)}
						className="metric views--used">View history</Link>
				</ContentBox>);
		} else {
			freeTrialInfo = <p className="intro">As an early Readup adopter, you can read for free.<br/> Please consider subscribing!</p>
		}

		return (
			<>
				{freeTrialInfo}
				{
					(status.isUserFreeForLife === true || !findTweetPromoCredit(status.freeTrial))
				? <div className="tweet-prompt">
					<p>Tweet about Readup{ status.isUserFreeForLife ? '!' : ' for 5 more free articles.'}</p>
					{(status.isUserFreeForLife === true || !findTweetPromoCredit(status.freeTrial)) &&
						<Button
							intent="loud"
							onClick={this._openTweetComposer}
							state={this.state.isTweeting ? 'busy' : 'normal'}
							iconLeft="twitter"
							size="normal"
							align="center"
							text="Tweet"
						/>
					}
					</div>
					: null
				}
				<div className="subscribe-prompt">
					<h2>Become a Reader</h2>
					<SubscribePitchElement/>
					<Button
						intent="loud"
						onClick={(_) => this.props.onOpenSubscriptionPromptDialog()}
						size="large"
						align="center"
						text="Subscribe"
					/>
				</div>
			</>
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
				return this._renderNeverSubscribedContent(this.props.subscriptionStatus);
			case SubscriptionStatusType.PaymentFailed:
				return (
					<>
						{this._renderFreeTrialNotice()}
						{this.props.subscriptionStatus.type === SubscriptionStatusType.PaymentFailed ?
							this.renderViewToggle() :
							null}
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
						{this._renderFreeTrialNotice()}
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
						{this._renderFreeTrialNotice()}
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
		create: (id: number, location: RouteLocation, sharedState: SharedState) => ({
			id,
			key,
			location,
			title: sharedState.subscriptionStatus.type === SubscriptionStatusType.NeverSubscribed ? 'Free Trial' : 'My Impact'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<MyImpactScreen
				onCreateStaticContentUrl={deps.onCreateStaticContentUrl}
				onGetSubscriptionDistributionSummary={deps.onGetSubscriptionDistributionSummary}
				onGetUserArticleHistory={deps.onGetUserArticleHistory}
				onNavTo={deps.onNavTo}
				onOpenPaymentConfirmationDialog={deps.onOpenPaymentConfirmationDialog}
				onOpenSubscriptionPromptDialog={deps.onOpenSubscriptionPromptDialog}
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