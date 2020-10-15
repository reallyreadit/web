
import * as React from 'react';
import BulkMailing from '../../../common/models/BulkMailing';
import Fetchable from '../../../common/Fetchable';
import ActionLink from '../../../common/components/ActionLink';
import CreateBulkMailingDialog from './AdminPage/CreateBulkMailingDialog';
import UserAccountStats from '../../../common/models/UserAccountStats';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../../../common/components/Toaster';
import AsyncTracker from '../../../common/AsyncTracker';
import { Screen, SharedState } from './Root';
import ScreenContainer from './ScreenContainer';
import { FetchFunctionWithParams } from '../serverApi/ServerApi';
import DailyTotalsReportRow from '../../../common/models/analytics/DailyTotalsReportRow';
import { DateTime } from 'luxon';
import RouteLocation from '../../../common/routing/RouteLocation';
import SignupsReportRow from '../../../common/models/analytics/SignupsReportRow';
import DateRangeQuery from '../../../common/models/analytics/DateRangeQuery';
import ConversionsReportRow from '../../../common/models/analytics/ConversionsReportRow';
import ArticleIssuesReportRow from '../../../common/models/analytics/ArticleIssuesReportRow';

interface Props {
	onCloseDialog: () => void,
	onGetArticleIssueReports: FetchFunctionWithParams<DateRangeQuery, ArticleIssuesReportRow[]>,
	onGetBulkMailings: (callback: (mailings: Fetchable<BulkMailing[]>) => void) => Fetchable<BulkMailing[]>,
	onGetBulkMailingLists: (callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) => Fetchable<{ key: string, value: string }[]>,
	onGetConversions: FetchFunctionWithParams<DateRangeQuery, ConversionsReportRow[]>,
	onGetDailyTotals: FetchFunctionWithParams<DateRangeQuery, DailyTotalsReportRow[]>,
	onGetSignups: FetchFunctionWithParams<DateRangeQuery, SignupsReportRow[]>,
	onGetUserStats: (callback: (state: Fetchable<UserAccountStats>) => void) => Fetchable<UserAccountStats>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onSendBulkMailing: (list: string, subject: string, body: string) => Promise<void>,
	onSendTestBulkMailing: (list: string, subject: string, body: string, emailAddress: string) => Promise<void>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	user: UserAccount
}
class AdminPage extends React.Component<
	Props,
	{
		articleIssueReports: {
			startDate: string,
			endDate: string,
			data: Fetchable<ArticleIssuesReportRow[]>
		},
		conversions: {
			startDate: string,
			endDate: string,
			data: Fetchable<ConversionsReportRow[]>
		},
		dailyTotals: {
			startDate: string,
			endDate: string,
			data: Fetchable<DailyTotalsReportRow[]>
		},
		signups: {
			startDate: string,
			endDate: string,
			data: Fetchable<SignupsReportRow[]>
		},
		userStats: Fetchable<UserAccountStats>,
		mailings: Fetchable<BulkMailing[]>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _reloadMailings = () => {
		this.setState({
			mailings: this.props.onGetBulkMailings(
				this._asyncTracker.addCallback(mailings => { this.setState({ mailings }); })
			)
		});
	};
	private readonly _openCreateMailingDialog = () => {
		this.props.onOpenDialog(
			<CreateBulkMailingDialog
				onCloseDialog={this.props.onCloseDialog}
				onGetLists={this.props.onGetBulkMailingLists}
				onSend={this.props.onSendBulkMailing}
				onSendTest={this.props.onSendTestBulkMailing}
				onSent={this._reloadMailings}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private readonly _setArticleIssueReportsStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			articleIssueReports: {
				...this.state.articleIssueReports,
				startDate: event.target.value
			}
		});
	};
	private readonly _setArticleIssueReportsEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			articleIssueReports: {
				...this.state.articleIssueReports,
				endDate: event.target.value
			}
		});
	};
	private readonly _setConversionsStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			conversions: {
				...this.state.conversions,
				startDate: event.target.value
			}
		});
	};
	private readonly _setConversionsEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			conversions: {
				...this.state.conversions,
				endDate: event.target.value
			}
		});
	};
	private readonly _setDailyTotalsStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			dailyTotals: {
				...this.state.dailyTotals,
				startDate: event.target.value
			}
		});
	};
	private readonly _setDailyTotalsEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			dailyTotals: {
				...this.state.dailyTotals,
				endDate: event.target.value
			}
		});
	};
	private readonly _setSignupsStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			signups: {
				...this.state.signups,
				startDate: event.target.value
			}
		});
	};
	private readonly _setSignupsEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			signups: {
				...this.state.signups,
				endDate: event.target.value
			}
		});
	};
	private readonly _fetchArticleIssueReports = () => {
		this.setState({
			articleIssueReports: {
				...this.state.articleIssueReports,
				data: this.fetchArticleIssueReports(this.state.articleIssueReports.startDate, this.state.articleIssueReports.endDate)
			}
		});
	};
	private readonly _fetchConversions = () => {
		this.setState({
			conversions: {
				...this.state.conversions,
				data: this.fetchConversions(this.state.conversions.startDate, this.state.conversions.endDate)
			}
		});
	};
	private readonly _fetchDailyTotals = () => {
		this.setState({
			dailyTotals: {
				...this.state.dailyTotals,
				data: this.fetchDailyTotals(this.state.dailyTotals.startDate, this.state.dailyTotals.endDate)
			}
		});
	};
	private readonly _fetchSignups = () => {
		this.setState({
			signups: {
				...this.state.signups,
				data: this.fetchSignups(this.state.signups.startDate, this.state.signups.endDate)
			}
		});
	};
	constructor(props: Props) {
		super(props);
		const
			localNow = DateTime.local(),
			localNowDate = DateTime
				.fromObject({
					year: localNow.year,
					month: localNow.month,
					day: localNow.day,
					zone: 'utc'
				}),
			articleIssueReportsStartDate = localNowDate
				.minus({ days: 14 })
				.toISO()
				.replace(/Z$/, ''),
			articleIssueReportsEndDate = localNowDate
				.plus({ days: 1 })
				.toISO()
				.replace(/Z$/, ''),
			dailyTotalsStartDate = localNowDate
				.minus({ days: 14 })
				.toISO()
				.replace(/Z$/, ''),
			dailyTotalsEndDate = localNowDate
				.toISO()
				.replace(/Z$/, ''),
			signupsStartDate = localNowDate
				.minus({ days: 14 })
				.toISO()
				.replace(/Z$/, ''),
			signupsEndDate = localNowDate
				.plus({ days: 1 })
				.toISO()
				.replace(/Z$/, ''),
			conversionsStartDate = localNowDate
				.minus({
					days: (localNowDate.weekday % 7) + (7 * 11)
				})
				.toISO()
				.replace(/Z$/, ''),
			conversionsEndDate = localNowDate
				.minus({
					days: localNowDate.weekday % 7
				})
				.toISO()
				.replace(/Z$/, '');
		this.state = {
			articleIssueReports: {
				startDate: articleIssueReportsStartDate,
				endDate: articleIssueReportsEndDate,
				data: this.fetchArticleIssueReports(articleIssueReportsStartDate, articleIssueReportsEndDate)
			},
			conversions: {
				startDate: conversionsStartDate,
				endDate: conversionsEndDate,
				data: this.fetchConversions(conversionsStartDate, conversionsEndDate)
			},
			dailyTotals: {
				startDate: dailyTotalsStartDate,
				endDate: dailyTotalsEndDate,
				data: this.fetchDailyTotals(dailyTotalsStartDate, dailyTotalsEndDate)
			},
			signups: {
				startDate: signupsStartDate,
				endDate: signupsEndDate,
				data: this.fetchSignups(signupsStartDate, signupsEndDate)
			},
			userStats: props.onGetUserStats(
				this._asyncTracker.addCallback(userStats => { this.setState({ userStats }); })
			),
			mailings: props.onGetBulkMailings(
				this._asyncTracker.addCallback(mailings => { this.setState({ mailings }); })
			)
		};
	}
	private fetchArticleIssueReports(startDate: string, endDate: string) {
		return this.props.onGetArticleIssueReports(
			{ startDate, endDate },
			this._asyncTracker.addCallback(rows => { this.setState({ articleIssueReports: { ...this.state.articleIssueReports, data: rows } }); })
		);
	}
	private fetchConversions(startDate: string, endDate: string) {
		return this.props.onGetConversions(
			{ startDate, endDate },
			this._asyncTracker.addCallback(rows => { this.setState({ conversions: { ...this.state.conversions, data: rows } }); })
		);
	}
	private fetchDailyTotals(startDate: string, endDate: string) {
		return this.props.onGetDailyTotals(
			{ startDate, endDate },
			this._asyncTracker.addCallback(rows => { this.setState({ dailyTotals: { ...this.state.dailyTotals, data: rows } }); })
		);
	}
	private fetchSignups(startDate: string, endDate: string) {
		return this.props.onGetSignups(
			{ startDate, endDate },
			this._asyncTracker.addCallback(rows => { this.setState({ signups: { ...this.state.signups, data: rows } }); })
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		// only show daily totals 'unknown' columns if present
		let
			hasUnknownDailyTotalSignups = false,
			hasUnknownDailyTotalReads = false,
			hasUnknownDailyTotalPosts = false,
			hasUnknownDailyTotalReplies = false,
			dailyTotalColumnCount = 13;
		if (this.state.dailyTotals.data.value) {
			if (
				hasUnknownDailyTotalSignups = this.state.dailyTotals.data.value.some(
					day => day.signupUnknownCount
				)
			) {
				dailyTotalColumnCount++;
			}
			if (
				hasUnknownDailyTotalReads = this.state.dailyTotals.data.value.some(
					day => day.readUnknownCount
				)
			) {
				dailyTotalColumnCount++;
			}
			if (
				hasUnknownDailyTotalPosts = this.state.dailyTotals.data.value.some(
					day => day.postUnknownCount
				)
			) {
				dailyTotalColumnCount++;
			}
			if (
				hasUnknownDailyTotalReplies = this.state.dailyTotals.data.value.some(
					day => day.replyUnknownCount
				)
			) {
				dailyTotalColumnCount++;
			}
		}
		return (
			<ScreenContainer>
				<div className="admin-page_czkowo">
					<table>
						<caption>
							<div className="content">
								<strong>User Stats</strong>
							</div>
						</caption>
						<tbody>
							{!this.state.userStats.isLoading ?
								this.state.userStats.value ?
									[
										<tr key="total">
											<th>Total Count</th>
											<td>{this.state.userStats.value.totalCount}</td>
										</tr>,
										<tr key="confirmed">
											<th>Confirmed Count</th>
											<td>{this.state.userStats.value.confirmedCount}</td>
										</tr>
									] :
									<tr>
										<td>Error loading stats.</td>
									</tr> :
								<tr>
									<td>Loading...</td>
								</tr>}
						</tbody>
					</table>
					<table>
						<caption>
							<div className="content">
								<strong>Daily Totals</strong>
								<div>
									<input
										type="text"
										value={this.state.dailyTotals.startDate}
										onChange={this._setDailyTotalsStartDate}
									/>
									<input
										type="text"
										value={this.state.dailyTotals.endDate}
										onChange={this._setDailyTotalsEndDate}
									/>
									<button onClick={this._fetchDailyTotals}>Run Report</button>
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th></th>
								<th colSpan={hasUnknownDailyTotalSignups ? 3 : 2}>Signups</th>
								<th colSpan={hasUnknownDailyTotalReads ? 3 : 2}>Reads</th>
								<th colSpan={hasUnknownDailyTotalPosts ? 3 : 2}>Posts</th>
								<th colSpan={hasUnknownDailyTotalReplies ? 3 : 2}>Replies</th>
								<th colSpan={2}>Post Tweets</th>
								<th colSpan={2}>Extensions</th>
							</tr>
							<tr>
								<th>Date</th>
								<th>App</th>
								<th>Browser</th>
								{hasUnknownDailyTotalSignups ?
									<th>N/A</th> :
									null}
								<th>App</th>
								<th>Browser</th>
								{hasUnknownDailyTotalReads ?
									<th>N/A</th> :
									null}
								<th>App</th>
								<th>Browser</th>
								{hasUnknownDailyTotalPosts ?
									<th>N/A</th> :
									null}
								<th>App</th>
								<th>Browser</th>
								{hasUnknownDailyTotalReplies ?
									<th>N/A</th> :
									null}
								<th>App</th>
								<th>Browser</th>
								<th>Installed</th>
								<th>Uninstalled</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.dailyTotals.data.isLoading ?
								this.state.dailyTotals.data.value ?
									this.state.dailyTotals.data.value.map(row => (
										<tr key={row.day}>
											<td>{row.day}</td>
											<td>{row.signupAppCount}</td>
											<td>{row.signupBrowserCount}</td>
											{hasUnknownDailyTotalSignups ?
												<td>{row.signupUnknownCount}</td> :
												null}
											<td>{row.readAppCount}</td>
											<td>{row.readBrowserCount}</td>
											{hasUnknownDailyTotalReads ?
												<td>{row.readUnknownCount}</td> :
												null}
											<td>{row.postAppCount}</td>
											<td>{row.postBrowserCount}</td>
											{hasUnknownDailyTotalPosts ?
												<td>{row.postUnknownCount}</td> :
												null}
											<td>{row.replyAppCount}</td>
											<td>{row.replyBrowserCount}</td>
											{hasUnknownDailyTotalReplies ?
												<td>{row.replyUnknownCount}</td> :
												null}
											<td>{row.postTweetAppCount}</td>
											<td>{row.postTweetBrowserCount}</td>
											<td>{row.extensionInstallationCount}</td>
											<td>{row.extensionRemovalCount}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={dailyTotalColumnCount}>Error loading daily totals.</td>
									</tr> :
								<tr>
									<td colSpan={dailyTotalColumnCount}>Loading...</td>
								</tr>}
						</tbody>
					</table>
					<table>
						<caption>
							<div className="content">
								<strong>Signups</strong>
								<div>
									<input
										type="text"
										value={this.state.signups.startDate}
										onChange={this._setSignupsStartDate}
									/>
									<input
										type="text"
										value={this.state.signups.endDate}
										onChange={this._setSignupsEndDate}
									/>
									<button onClick={this._fetchSignups}>Run Report</button>
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th>Date Created</th>
								<th>Id</th>
								<th>Name</th>
								<th>Email</th>
								<th>Time Zone Name</th>
								<th>Client Mode</th>
								<th>Referrer Url</th>
								<th>Initial Path</th>
								<th>Current Path</th>
								<th>Action</th>
								<th>Orientation Shares</th>
								<th>Article Views</th>
								<th>Article Reads</th>
								<th>Post Tweets</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.signups.data.isLoading ?
								this.state.signups.data.value ?
									this.state.signups.data.value.map(row => (
										<tr key={row.id}>
											<td>{row.dateCreated}</td>
											<td>{row.id}</td>
											<td>{row.name}</td>
											<td>{row.email}</td>
											<td>{row.timeZoneName}</td>
											<td>{row.clientMode}</td>
											<td>{row.referrerUrl}</td>
											<td>{row.initialPath}</td>
											<td>{row.currentPath}</td>
											<td>{row.action}</td>
											<td>{row.orientationShareCount}</td>
											<td>{row.articleViewCount}</td>
											<td>{row.articleReadCount}</td>
											<td>{row.postTweetCount}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={15}>Error loading signups.</td>
									</tr> :
								<tr>
									<td colSpan={15}>Loading...</td>
								</tr>}
						</tbody>
					</table>
					<table>
						<caption>
							<div className="content">
								<strong>Conversions</strong>
								<div>
									<input
										type="text"
										value={this.state.conversions.startDate}
										onChange={this._setConversionsStartDate}
									/>
									<input
										type="text"
										value={this.state.conversions.endDate}
										onChange={this._setConversionsEndDate}
									/>
									<button onClick={this._fetchConversions}>Run Report</button>
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th>Week</th>
								<th>Visits</th>
								<th>Signups</th>
								<th>Signup Conversion</th>
								<th>Shares</th>
								<th>Share Conversion</th>
								<th>Article Views</th>
								<th>Article View Conversion</th>
								<th>Article Reads</th>
								<th>Article Read Conversion</th>
								<th>Post Tweets</th>
								<th>Post Tweet Conversion</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.conversions.data.isLoading ?
								this.state.conversions.data.value ?
									this.state.conversions.data.value.map(row => (
										<tr key={row.week}>
											<td>{row.week}</td>
											<td>{row.visitCount}</td>
											<td>{row.signupCount}</td>
											<td>{row.signupConversion.toFixed(2)}</td>
											<td>{row.shareCount}</td>
											<td>{row.shareConversion.toFixed(2)}</td>
											<td>{row.articleViewCount}</td>
											<td>{row.articleViewConversion.toFixed(2)}</td>
											<td>{row.articleReadCount}</td>
											<td>{row.articleReadConversion.toFixed(2)}</td>
											<td>{row.postTweetCount}</td>
											<td>{row.postTweetConversion.toFixed(2)}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={12}>Error loading converions.</td>
									</tr> :
								<tr>
									<td colSpan={12}>Loading...</td>
								</tr>}
						</tbody>
					</table>
					<table>
						<caption>
							<div className="content">
								<strong>Article Issue Reports</strong>
								<div>
									<input
										type="text"
										value={this.state.articleIssueReports.startDate}
										onChange={this._setArticleIssueReportsStartDate}
									/>
									<input
										type="text"
										value={this.state.articleIssueReports.endDate}
										onChange={this._setArticleIssueReportsEndDate}
									/>
									<button onClick={this._fetchArticleIssueReports}>Run Report</button>
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th>User</th>
								<th>Date Created</th>
								<th>Client Type</th>
								<th>Issue</th>
								<th>URL</th>
								<th>AOTD Rank</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.articleIssueReports.data.isLoading ?
								this.state.articleIssueReports.data.value ?
									this.state.articleIssueReports.data.value.map(row => (
										<tr key={row.dateCreated}>
											<td>{row.userName}</td>
											<td>{row.dateCreated}</td>
											<td>{row.clientType}</td>
											<td>{row.issue}</td>
											<td>
												<a href={row.articleUrl}>{row.articleUrl}</a>
											</td>
											<td>{row.articleAotdContenderRank}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={6}>Error loading article issue reports.</td>
									</tr> :
								<tr>
									<td colSpan={6}>Loading...</td>
								</tr>}
						</tbody>
					</table>
					<table>
						<caption>
							<div className="content">
								<strong>Bulk Mailings</strong>
								<ActionLink iconLeft="plus" text="Create" onClick={this._openCreateMailingDialog} />
							</div>
						</caption>
						<thead>
							<tr>
								<th>Date Sent</th>
								<th>Subject</th>
								<th>Body</th>
								<th>List</th>
								<th>Sent By</th>
								<th>Recipient Count</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.mailings.isLoading ?
								this.state.mailings.value ?
									this.state.mailings.value.length ?
										this.state.mailings.value.map(m => (
											<tr key={m.id}>
												<td>{m.dateSent}</td>
												<td>{m.subject}</td>
												<td>{m.body}</td>
												<td>{m.list}</td>
												<td>{m.userAccount}</td>
												<td>{m.recipientCount - m.errorCount}/{m.recipientCount}</td>
											</tr>
										)) :
										<tr>
											<td colSpan={6}>No mailings found.</td>
										</tr> :
									<tr>
										<td colSpan={6}>Error loading mailings.</td>
									</tr> :
								<tr>
									<td colSpan={6}>Loading...</td>
								</tr>}
						</tbody>
					</table>
				</div>
			</ScreenContainer>
		);
	}
}
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Admin' }),
		render: (screenState: Screen, sharedState: SharedState) => {
			return (
				<AdminPage
					onCloseDialog={deps.onCloseDialog}
					onGetArticleIssueReports={deps.onGetArticleIssueReports}
					onGetBulkMailings={deps.onGetBulkMailings}
					onGetBulkMailingLists={deps.onGetBulkMailingLists}
					onGetConversions={deps.onGetConversions}
					onGetDailyTotals={deps.onGetDailyTotals}
					onGetSignups={deps.onGetSignups}
					onGetUserStats={deps.onGetUserStats}
					onOpenDialog={deps.onOpenDialog}
					onSendBulkMailing={deps.onSendBulkMailing}
					onSendTestBulkMailing={deps.onSendTestBulkMailing}
					onShowToast={deps.onShowToast}
					user={sharedState.user}
				/>
			);
		}
	}
}