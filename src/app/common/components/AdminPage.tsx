import * as React from 'react';
import BulkMailing from '../../../common/models/BulkMailing';
import Fetchable from '../serverApi/Fetchable';
import ActionLink from '../../../common/components/ActionLink';
import CreateBulkMailingDialog from './AdminPage/CreateBulkMailingDialog';
import UserAccountStats from '../../../common/models/UserAccountStats';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../../../common/components/Toaster';
import AsyncTracker from '../../../common/AsyncTracker';
import { Screen, SharedState } from './Root';

interface Props {
	onCloseDialog: () => void,
	onGetBulkMailings: (callback: (mailings: Fetchable<BulkMailing[]>) => void) => Fetchable<BulkMailing[]>,
	onGetBulkMailingLists: (callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) => Fetchable<{ key: string, value: string }[]>,
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
	constructor(props: Props) {
		super(props);
		this.state = {
			userStats: props.onGetUserStats(
				this._asyncTracker.addCallback(userStats => { this.setState({ userStats }); })
			),
			mailings: props.onGetBulkMailings(
				this._asyncTracker.addCallback(mailings => { this.setState({ mailings }); })
			)
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
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
		);
	}
}
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: () => ({ key, title: 'Admin' }),
		render: (screenState: Screen, sharedState: SharedState) => {
			return (
				<AdminPage
					onCloseDialog={deps.onCloseDialog}
					onGetBulkMailings={deps.onGetBulkMailings}
					onGetBulkMailingLists={deps.onGetBulkMailingLists}
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