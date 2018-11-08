import * as React from 'react';
import BulkMailing from '../../../common/models/BulkMailing';
import Fetchable from '../serverApi/Fetchable';
import ActionLink from '../../../common/components/ActionLink';
import CreateBulkMailingDialog from './AdminPage/CreateBulkMailingDialog';
import UserStats from '../../../common/models/UserStats';
import ChallengeWinner from '../../../common/models/ChallengeWinner';
import ChallengeResponseTotal from '../../../common/models/ChallengeResponseTotal';
import { stringMap as challengeResponseActionStringMap } from '../../../common/models/ChallengeResponseAction';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from './Toaster';
import CallbackStore from '../CallbackStore';
import { Screen, RootState } from './Root';

interface Props {
	onCloseDialog: () => void,
	onGetBulkMailings: (callback: (mailings: Fetchable<BulkMailing[]>) => void) => Fetchable<BulkMailing[]>,
	onGetBulkMailingLists: (callback: (mailings: Fetchable<{ key: string, value: string }[]>) => void) => Fetchable<{ key: string, value: string }[]>,
	onGetChallengeResponseActionTotals: (challengeId: number, callback: (state: Fetchable<ChallengeResponseTotal[]>) => void) => Fetchable<ChallengeResponseTotal[]>,
	onGetChallengeWinners: (challengeId: number, callback: (state: Fetchable<ChallengeWinner[]>) => void) => Fetchable<ChallengeWinner[]>,
	onGetUserStats: (callback: (state: Fetchable<UserStats>) => void) => Fetchable<UserStats>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onSendBulkMailing: (list: string, subject: string, body: string) => Promise<void>,
	onSendTestBulkMailing: (list: string, subject: string, body: string, emailAddress: string) => Promise<void>,
	onShowToast: (text: string, intent: Intent) => void,
	user: UserAccount
}
class AdminPage extends React.Component<
	Props,
	{
		userStats: Fetchable<UserStats>,
		challengeResponseTotals: Fetchable<ChallengeResponseTotal[]>,
		challengeWinners: Fetchable<ChallengeWinner[]>,
		mailings: Fetchable<BulkMailing[]>
	}
> {
	private readonly _callbacks = new CallbackStore();
	private readonly _reloadMailings = () => {
		this.setState({
			mailings: this.props.onGetBulkMailings(
				this._callbacks.add(mailings => { this.setState({ mailings }); })
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
				this._callbacks.add(userStats => { this.setState({ userStats }); })
			),
			challengeResponseTotals: props.onGetChallengeResponseActionTotals(
				1,
				this._callbacks.add(
					challengeResponseTotals => {
						this.setState({ challengeResponseTotals });
					}
				)
			),
			challengeWinners: props.onGetChallengeWinners(
				1,
				this._callbacks.add(
					challengeWinners => {
						this.setState({ challengeWinners });
					}
				)
			),
			mailings: props.onGetBulkMailings(
				this._callbacks.add(mailings => { this.setState({ mailings }); })
			)
		};
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
	}
	public render() {
		return (
			<div className="admin-page">
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
							<strong>Challenge Response Action Totals</strong>
						</div>
					</caption>
					<thead>
						<tr>
							<th>Action</th>
							<th>Count</th>
						</tr>
					</thead>
					<tbody>
						{!this.state.challengeResponseTotals.isLoading ?
							this.state.challengeResponseTotals.value ?
								this.state.challengeResponseTotals.value.length ?
									this.state.challengeResponseTotals.value.map(t => (
										<tr key={t.action}>
											<td>{challengeResponseActionStringMap[t.action]}</td>
											<td>{t.count}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={2}>No responses found.</td>
									</tr> :
								<tr>
									<td colSpan={2}>Error loading responses.</td>
								</tr> :
							<tr>
								<td colSpan={2}>Loading...</td>
							</tr>}
					</tbody>
				</table>
				<table>
					<caption>
						<div className="content">
							<strong>Challenge Winners</strong>
						</div>
					</caption>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Date Awarded</th>
						</tr>
					</thead>
					<tbody>
						{!this.state.challengeWinners.isLoading ?
							this.state.challengeWinners.value ?
								this.state.challengeWinners.value.length ?
									this.state.challengeWinners.value.map(w => (
										<tr key={w.name}>
											<td>{w.name}</td>
											<td>{w.email}</td>
											<td>{w.dateAwarded}</td>
										</tr>
									)) :
									<tr>
										<td colSpan={3}>No winners found.</td>
									</tr> :
								<tr>
									<td colSpan={3}>Error loading winners.</td>
								</tr> :
							<tr>
								<td colSpan={3}>Loading...</td>
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
		render: (screenState: Screen, rootState: RootState) => {
			return (
				<AdminPage
					onCloseDialog={deps.onCloseDialog}
					onGetBulkMailings={deps.onGetBulkMailings}
					onGetBulkMailingLists={deps.onGetBulkMailingLists}
					onGetChallengeResponseActionTotals={deps.onGetChallengeResponseActionTotals}
					onGetChallengeWinners={deps.onGetChallengeWinners}
					onGetUserStats={deps.onGetUserStats}
					onOpenDialog={deps.onOpenDialog}
					onSendBulkMailing={deps.onSendBulkMailing}
					onSendTestBulkMailing={deps.onSendTestBulkMailing}
					onShowToast={deps.onShowToast}
					user={rootState.user}
				/>
			);
		}
	}
}