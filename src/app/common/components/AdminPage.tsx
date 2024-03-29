// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import BulkMailing, {
	BulkMailingTestRequest,
	BulkMailingRequest,
	BulkEmailSubscriptionStatusFilter,
} from '../../../common/models/BulkMailing';
import Fetchable from '../../../common/Fetchable';
import Link from '../../../common/components/Link';
import CreateBulkMailingDialog from './AdminPage/CreateBulkMailingDialog';
import UserAccountStats from '../../../common/models/UserAccountStats';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../../../common/components/Toaster';
import AsyncTracker from '../../../common/AsyncTracker';
import { Screen, SharedState, NavReference } from './Root';
import { FetchFunctionWithParams, FetchFunction } from '../serverApi/ServerApi';
import DailyTotalsReportRow from '../../../common/models/analytics/DailyTotalsReportRow';
import RouteLocation from '../../../common/routing/RouteLocation';
import SignupsReportRow from '../../../common/models/analytics/SignupsReportRow';
import { WeeklyUserActivityReport as WeeklyUserActivityReportRow } from '../../../common/models/analytics/WeeklyUserActivityReport';
import DateRangeQuery from '../../../common/models/analytics/DateRangeQuery';
import ConversionsReportRow from '../../../common/models/analytics/ConversionsReportRow';
import ArticleIssuesReportRow from '../../../common/models/analytics/ArticleIssuesReportRow';
import { ArticleAuthorControl } from './AdminPage/ArticleAuthorControl';
import {
	AuthorAssignmentRequest,
	AuthorUnassignmentRequest,
} from '../../../common/models/articles/AuthorAssignment';
import { AuthorMetadataAssignmentQueueResponse } from '../../../common/models/analytics/AuthorMetadataAssignmentQueue';
import ScreenKey from '../../../common/routing/ScreenKey';
import { calculateEstimatedReadTime } from '../../../common/calculate';
import { truncateText } from '../../../common/format';
import { RevenueReportResponse } from '../../../common/models/analytics/RevenueReport';
import { RevenueReport } from './AdminPage/RevenueReport';
import { DailyTotalsReport } from './AdminPage/DailyTotalsReport';
import { SignupsReport } from './AdminPage/SignupsReport';
import { ConversionsReport } from './AdminPage/ConversionsReport';
import { ArticleIssuesReport } from './AdminPage/ArticleIssuesReport';
import { WeeklyUserActivityReport } from './AdminPage/WeeklyUserActivityReport';
import {
	PayoutReportRequest,
	PayoutReportResponse,
} from '../../../common/models/subscriptions/PayoutReport';
import { AuthorUserAccountAssignmentRequest } from '../../../common/models/authors/AuthorUserAccountAssignment';
import { PayoutReport } from './AdminPage/PayoutReport';
import { AuthorUserAccountControl } from './AdminPage/AuthorUserAccountControl';

const bulkMailingSubscriptionStatusLabels: {
	[key in BulkEmailSubscriptionStatusFilter]: string;
} = {
	[BulkEmailSubscriptionStatusFilter.CurrentlySubscribed]:
		'Currently Subscribed',
	[BulkEmailSubscriptionStatusFilter.NeverSubscribed]: 'Never Subscribed',
	[BulkEmailSubscriptionStatusFilter.NotCurrentlySubscribed]:
		'Not Currently Subscribed',
};
interface Props {
	onAssignAuthorToArticle: (request: AuthorAssignmentRequest) => Promise<void>;
	onAssignUserAccountToAuthor: (
		request: AuthorUserAccountAssignmentRequest
	) => Promise<void>;
	onCloseDialog: () => void;
	onGetArticleIssueReports: FetchFunctionWithParams<
		DateRangeQuery,
		ArticleIssuesReportRow[]
	>;
	onGetAuthorMetadataAssignmentQueue: FetchFunction<AuthorMetadataAssignmentQueueResponse>;
	onGetBulkMailings: (
		callback: (mailings: Fetchable<BulkMailing[]>) => void
	) => Fetchable<BulkMailing[]>;
	onGetConversions: FetchFunctionWithParams<
		DateRangeQuery,
		ConversionsReportRow[]
	>;
	onGetDailyTotals: FetchFunctionWithParams<
		DateRangeQuery,
		DailyTotalsReportRow[]
	>;
	onGetPayoutReport: FetchFunctionWithParams<
		PayoutReportRequest,
		PayoutReportResponse
	>;
	onGetRevenueReport: FetchFunctionWithParams<
		DateRangeQuery,
		RevenueReportResponse
	>;
	onGetSignups: FetchFunctionWithParams<DateRangeQuery, SignupsReportRow[]>;
	onGetUserStats: (
		callback: (state: Fetchable<UserAccountStats>) => void
	) => Fetchable<UserAccountStats>;
	onGetWeeklyUserActivityReport: FetchFunctionWithParams<
		DateRangeQuery,
		WeeklyUserActivityReportRow[]
	>;
	onNavTo: (ref: NavReference) => void;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onSendBulkMailing: (request: BulkMailingRequest) => Promise<void>;
	onSendTestBulkMailing: (request: BulkMailingTestRequest) => Promise<void>;
	onShowToast: (content: React.ReactNode, intent: Intent) => void;
	onUnassignAuthorFromArticle: (
		request: AuthorUnassignmentRequest
	) => Promise<void>;
	user: UserAccount;
}
class AdminPage extends React.Component<
	Props,
	{
		authorMetadataAssignmentQueueResponse: Fetchable<AuthorMetadataAssignmentQueueResponse> | null;
		userStats: Fetchable<UserAccountStats>;
		mailings: Fetchable<BulkMailing[]>;
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _reloadMailings = () => {
		this.setState({
			mailings: this.props.onGetBulkMailings(
				this._asyncTracker.addCallback((mailings) => {
					this.setState({ mailings });
				})
			),
		});
	};
	private readonly _openCreateMailingDialog = () => {
		this.props.onOpenDialog(
			<CreateBulkMailingDialog
				onCloseDialog={this.props.onCloseDialog}
				onSend={this.props.onSendBulkMailing}
				onSendTest={this.props.onSendTestBulkMailing}
				onSent={this._reloadMailings}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private readonly _fetchAuthorMetadataAssignmentQueue = () => {
		this.setState({
			authorMetadataAssignmentQueueResponse:
				this.props.onGetAuthorMetadataAssignmentQueue(
					this._asyncTracker.addCallback(
						(authorMetadataAssignmentQueueResponse) => {
							this.setState({
								authorMetadataAssignmentQueueResponse,
							});
						}
					)
				),
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			authorMetadataAssignmentQueueResponse: null,
			userStats: props.onGetUserStats(
				this._asyncTracker.addCallback((userStats) => {
					this.setState({ userStats });
				})
			),
			mailings: props.onGetBulkMailings(
				this._asyncTracker.addCallback((mailings) => {
					this.setState({ mailings });
				})
			),
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="admin-page_czkowo">
				<h2>Stats</h2>
				<table>
					<caption>
						<div className="content">
							<strong>User Stats</strong>
						</div>
					</caption>
					<tbody>
						{!this.state.userStats.isLoading ? (
							this.state.userStats.value ? (
								[
									<tr key="total">
										<th>Total Count</th>
										<td>{this.state.userStats.value.totalCount}</td>
									</tr>,
									<tr key="confirmed">
										<th>Confirmed Count</th>
										<td>{this.state.userStats.value.confirmedCount}</td>
									</tr>,
								]
							) : (
								<tr>
									<td>Error loading stats.</td>
								</tr>
							)
						) : (
							<tr>
								<td>Loading...</td>
							</tr>
						)}
					</tbody>
				</table>
				<h2>Reports</h2>
				<RevenueReport onGetRevenueReport={this.props.onGetRevenueReport} />
				<ConversionsReport onGetConversions={this.props.onGetConversions} />
				<WeeklyUserActivityReport
					onGetWeeklyUserActivityReport={
						this.props.onGetWeeklyUserActivityReport
					}
				/>
				<DailyTotalsReport onGetDailyTotals={this.props.onGetDailyTotals} />
				<SignupsReport onGetSignups={this.props.onGetSignups} />
				<ArticleIssuesReport
					onGetArticleIssueReports={this.props.onGetArticleIssueReports}
				/>
				<PayoutReport onGetPayoutReport={this.props.onGetPayoutReport} />
				<h2>Tools</h2>
				<AuthorUserAccountControl
					onAssignUserAccountToAuthor={this.props.onAssignUserAccountToAuthor}
					onShowToast={this.props.onShowToast}
				/>
				<ArticleAuthorControl
					onAssignAuthorToArticle={this.props.onAssignAuthorToArticle}
					onShowToast={this.props.onShowToast}
					onUnassignAuthorFromArticle={this.props.onUnassignAuthorFromArticle}
				/>
				<table>
					<caption>
						<div className="content">
							<strong>Article Author Assignment Queue</strong>
							<div>
								<button onClick={this._fetchAuthorMetadataAssignmentQueue}>
									Run Report
								</button>
							</div>
						</div>
					</caption>
					<thead>
						<tr>
							<th>Title</th>
							<th>Publisher URL</th>
							<th>Authors</th>
							<th>Length</th>
						</tr>
					</thead>
					<tbody>
						{this.state.authorMetadataAssignmentQueueResponse ? (
							this.state.authorMetadataAssignmentQueueResponse.isLoading ? (
								<tr>
									<td colSpan={4}>Loading...</td>
								</tr>
							) : this.state.authorMetadataAssignmentQueueResponse.value ? (
								this.state.authorMetadataAssignmentQueueResponse.value
									.articles.length ? (
									this.state.authorMetadataAssignmentQueueResponse.value.articles.map(
										(article) => {
											const [sourceSlug, articleSlug] =
												article.slug.split('_');
											return (
												<tr key={article.id}>
													<td>
														<Link
															screen={ScreenKey.Comments}
															params={{ sourceSlug, articleSlug }}
															onClick={this.props.onNavTo}
															text={truncateText(article.title, 30)}
														/>
													</td>
													<td>
														<Link
															href={article.url}
															onClick={this.props.onNavTo}
															text={truncateText(article.url, 30)}
														/>
													</td>
													<td>
														{article.articleAuthors
															.map((author) => author.slug)
															.join(' ')}
													</td>
													<td>
														{calculateEstimatedReadTime(article.wordCount)}{' '}
														min.
													</td>
												</tr>
											);
										}
									)
								) : (
									<tr>
										<td colSpan={4}>Queue is empty. Good job!</td>
									</tr>
								)
							) : (
								<tr>
									<td colSpan={4}>Error loading queue.</td>
								</tr>
							)
						) : (
							<tr>
								<td colSpan={4}>Click "Run Report" to load queue.</td>
							</tr>
						)}
					</tbody>
				</table>
				<table>
					<caption>
						<div className="content">
							<strong>Bulk Mailings</strong>
							<Link
								iconLeft="plus"
								text="Create"
								onClick={this._openCreateMailingDialog}
							/>
						</div>
					</caption>
					<thead>
						<tr>
							<th>Date Sent</th>
							<th>Subject</th>
							<th>Body</th>
							<th>Type</th>
							<th>Subscription Status</th>
							<th>Free-for-life Status</th>
							<th>User Created After</th>
							<th>User Created Before</th>
							<th>Sent By</th>
							<th>Recipient Count</th>
						</tr>
					</thead>
					<tbody>
						{!this.state.mailings.isLoading ? (
							this.state.mailings.value ? (
								this.state.mailings.value.length ? (
									this.state.mailings.value.map((m) => (
										<tr key={m.id}>
											<td>{m.dateSent}</td>
											<td>{m.subject}</td>
											<td>{m.body}</td>
											<td>{m.type}</td>
											<td>
												{m.subscriptionStatusFilter != null
													? bulkMailingSubscriptionStatusLabels[
															m.subscriptionStatusFilter
														]
													: 'Any'}
											</td>
											<td>
												{m.freeForLifeFilter != null
													? m.freeForLifeFilter
														? 'Free-for-life'
														: 'Not Free-for-life'
													: 'Any'}
											</td>
											<td>{m.userCreatedAfterFilter}</td>
											<td>{m.userCreatedBeforeFilter}</td>
											<td>{m.userAccount}</td>
											<td>{m.recipientCount}</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={10}>No mailings found.</td>
									</tr>
								)
							) : (
								<tr>
									<td colSpan={10}>Error loading mailings.</td>
								</tr>
							)
						) : (
							<tr>
								<td colSpan={10}>Loading...</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'Admin'
			},
		}),
		render: (screenState: Screen, sharedState: SharedState) => {
			return (
				<AdminPage
					onAssignAuthorToArticle={deps.onAssignAuthorToArticle}
					onAssignUserAccountToAuthor={deps.onAssignUserAccountToAuthor}
					onCloseDialog={deps.onCloseDialog}
					onGetArticleIssueReports={deps.onGetArticleIssueReports}
					onGetAuthorMetadataAssignmentQueue={
						deps.onGetAuthorMetadataAssignmentQueue
					}
					onGetBulkMailings={deps.onGetBulkMailings}
					onGetConversions={deps.onGetConversions}
					onGetDailyTotals={deps.onGetDailyTotals}
					onGetPayoutReport={deps.onGetPayoutReport}
					onGetRevenueReport={deps.onGetRevenueReport}
					onGetSignups={deps.onGetSignups}
					onGetUserStats={deps.onGetUserStats}
					onGetWeeklyUserActivityReport={deps.onGetWeeklyUserActivityReport}
					onNavTo={deps.onNavTo}
					onOpenDialog={deps.onOpenDialog}
					onSendBulkMailing={deps.onSendBulkMailing}
					onSendTestBulkMailing={deps.onSendTestBulkMailing}
					onShowToast={deps.onShowToast}
					onUnassignAuthorFromArticle={deps.onUnassignAuthorFromArticle}
					user={sharedState.user}
				/>
			);
		},
	};
}
