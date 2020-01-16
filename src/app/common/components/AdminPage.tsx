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
import KeyMetricsReportRow from '../../../common/models/KeyMetricsReportRow';
import { DateTime } from 'luxon';
import RouteLocation from '../../../common/routing/RouteLocation';
import UserAccountCreation from '../../../common/models/UserAccountCreation';

interface Props {
	onCloseDialog: () => void,
	onGetBulkMailings: (callback: (mailings: Fetchable<BulkMailing[]>) => void) => Fetchable<BulkMailing[]>,
	onGetBulkMailingLists: (callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) => Fetchable<{ key: string, value: string }[]>,
	onGetKeyMetrics: FetchFunctionWithParams<{ startDate: string, endDate: string }, KeyMetricsReportRow[]>,
	onGetUserAccountCreations: FetchFunctionWithParams<{ startDate: string, endDate: string }, UserAccountCreation[]>,
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
		keyMetrics: {
			startDate: string,
			endDate: string,
			data: Fetchable<KeyMetricsReportRow[]>
		},
		userAccountCreations: {
			startDate: string,
			endDate: string,
			data: Fetchable<UserAccountCreation[]>
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
	private readonly _setKeyMetricsStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			keyMetrics: {
				...this.state.keyMetrics,
				startDate: event.target.value
			}
		});
	};
	private readonly _setKeyMetricsEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			keyMetrics: {
				...this.state.keyMetrics,
				endDate: event.target.value
			}
		});
	};
	private readonly _setUserAccountCreationsStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			userAccountCreations: {
				...this.state.userAccountCreations,
				startDate: event.target.value
			}
		});
	};
	private readonly _setUserAccountCreationsEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			userAccountCreations: {
				...this.state.userAccountCreations,
				endDate: event.target.value
			}
		});
	};
	private readonly _fetchKeyMetrics = () => {
		this.setState({
			keyMetrics: {
				...this.state.keyMetrics,
				data: this.fetchKeyMetrics(this.state.keyMetrics.startDate, this.state.keyMetrics.endDate)
			}
		});
	};
	private readonly _fetchUserAccountCreations = () => {
		this.setState({
			userAccountCreations: {
				...this.state.userAccountCreations,
				data: this.fetchUserAccountCreations(this.state.userAccountCreations.startDate, this.state.userAccountCreations.endDate)
			}
		});
	};
	constructor(props: Props) {
		super(props);
		const
			localNow = DateTime.local(),
			utcNowDate = DateTime
				.fromObject({
					year: localNow.year,
					month: localNow.month,
					day: localNow.day,
					zone: 'utc'
				})
				.minus({ minutes: localNow.offset }),
			startDate = utcNowDate
				.minus({ days: 30 })
				.toISO()
				.replace(/Z$/, ''),
			keyMetricsEndDate = utcNowDate
				.toISO()
				.replace(/Z$/, ''),
			userAccountCreationsEndDate = utcNowDate
				.plus({ days: 1 })
				.toISO()
				.replace(/Z$/, '');
		this.state = {
			keyMetrics: {
				startDate,
				endDate: keyMetricsEndDate,
				data: this.fetchKeyMetrics(startDate, keyMetricsEndDate)
			},
			userAccountCreations: {
				startDate,
				endDate: userAccountCreationsEndDate,
				data: this.fetchUserAccountCreations(startDate, userAccountCreationsEndDate)
			},
			userStats: props.onGetUserStats(
				this._asyncTracker.addCallback(userStats => { this.setState({ userStats }); })
			),
			mailings: props.onGetBulkMailings(
				this._asyncTracker.addCallback(mailings => { this.setState({ mailings }); })
			)
		};
	}
	private fetchKeyMetrics(startDate: string, endDate: string) {
		return this.props.onGetKeyMetrics(
			{ startDate, endDate },
			this._asyncTracker.addCallback(keyMetrics => { this.setState({ keyMetrics: { ...this.state.keyMetrics, data: keyMetrics } }); })
		);
	}
	private fetchUserAccountCreations(startDate: string, endDate: string) {
		return this.props.onGetUserAccountCreations(
			{ startDate, endDate },
			this._asyncTracker.addCallback(userAccountCreations => { this.setState({ userAccountCreations: { ...this.state.userAccountCreations, data: userAccountCreations } }); })
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
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
								<strong>Key Metrics</strong>
								<div>
									<input
										type="text"
										value={this.state.keyMetrics.startDate}
										onChange={this._setKeyMetricsStartDate}
									/>
									<input
										type="text"
										value={this.state.keyMetrics.endDate}
										onChange={this._setKeyMetricsEndDate}
									/>
									<button onClick={this._fetchKeyMetrics}>Run Report</button>
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th></th>
								<th colSpan={3}>Accounts Created</th>
								<th colSpan={3}>Articles Read</th>
								<th colSpan={3}>Comments Created</th>
								<th colSpan={2}>Extensions</th>
							</tr>
							<tr>
								<th>Date</th>
								<th>App</th>
								<th>Browser</th>
								<th>Unknown</th>
								<th>App</th>
								<th>Browser</th>
								<th>Unknown</th>
								<th>App</th>
								<th>Browser</th>
								<th>Unknown</th>
								<th>Installed</th>
								<th>Uninstalled</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.keyMetrics.data.isLoading ?
								this.state.keyMetrics.data.value ?
									this.state.keyMetrics.data.value.map(row => (
										<tr key={row.day}>
											<td>{row.day}</td>
											<td>{row.userAccountAppCount}</td>
											<td>{row.userAccountBrowserCount}</td>
											<td>{row.userAccountUnknownCount}</td>
											<td>{row.readAppCount}</td>
											<td>{row.readBrowserCount}</td>
											<td>{row.readUnknownCount}</td>
											<td>{row.commentAppCount}</td>
											<td>{row.commentBrowserCount}</td>
											<td>{row.commentUnknownCount}</td>
											<td>{row.extensionInstallationCount}</td>
											<td>{row.extensionRemovalCount}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={12}>Error loading key metrics.</td>
									</tr> :
								<tr>
									<td colSpan={12}>Loading...</td>
								</tr>}
						</tbody>
					</table>
					<table>
						<caption>
							<div className="content">
								<strong>User Account Creations</strong>
								<div>
									<input
										type="text"
										value={this.state.userAccountCreations.startDate}
										onChange={this._setUserAccountCreationsStartDate}
									/>
									<input
										type="text"
										value={this.state.userAccountCreations.endDate}
										onChange={this._setUserAccountCreationsEndDate}
									/>
									<button onClick={this._fetchUserAccountCreations}>Run Report</button>
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th>Date Created</th>
								<th>Id</th>
								<th>Name</th>
								<th>Time Zone Name</th>
								<th>Client Mode</th>
								<th>Marketing Variant</th>
								<th>Referrer Url</th>
								<th>Initial Path</th>
								<th>Current Path</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{!this.state.userAccountCreations.data.isLoading ?
								this.state.userAccountCreations.data.value ?
									this.state.userAccountCreations.data.value.map(row => (
										<tr key={row.id}>
											<td>{row.dateCreated}</td>
											<td>{row.id}</td>
											<td>{row.name}</td>
											<td>{row.timeZoneName}</td>
											<td>{row.clientMode}</td>
											<td>{row.marketingVariant}</td>
											<td>{row.referrerUrl}</td>
											<td>{row.initialPath}</td>
											<td>{row.currentPath}</td>
											<td>{row.action}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={8}>Error loading user account creations.</td>
									</tr> :
								<tr>
									<td colSpan={8}>Loading...</td>
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
					onGetBulkMailings={deps.onGetBulkMailings}
					onGetBulkMailingLists={deps.onGetBulkMailingLists}
					onGetKeyMetrics={deps.onGetKeyMetrics}
					onGetUserAccountCreations={deps.onGetUserAccountCreations}
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