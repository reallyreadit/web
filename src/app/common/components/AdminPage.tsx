import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import BulkMailing from '../../../common/models/BulkMailing';
import Fetchable from '../api/Fetchable';
import ActionLink from '../../../common/components/ActionLink';
import CreateBulkMailingDialog from './AdminPage/CreateBulkMailingDialog';
import UserStats from '../../../common/models/UserStats';
import ChallengeWinner from '../../../common/models/ChallengeWinner';
import ChallengeResponseTotal from '../../../common/models/ChallengeResponseTotal';
import { stringMap as challengeResponseActionStringMap } from '../../../common/models/ChallengeResponseAction';
import Page from './Page';

const title = 'Admin';
export default class extends React.Component<
	RouteComponentProps<{}>,
	{
		userStats: Fetchable<UserStats>,
		challengeResponseTotals: Fetchable<ChallengeResponseTotal[]>,
		challengeWinners: Fetchable<ChallengeWinner[]>,
		mailings: Fetchable<BulkMailing[]>
	}
> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _goToHome = () => this.context.router.history.push('/');
	private readonly _reloadMailings = () => {
		this.setState({
			mailings: this.context.api.getBulkMailings(mailings => {
				this.setState({ mailings });
			})
		});
	};
	private readonly _openCreateMailingDialog = () => this.context.page.openDialog(
		<CreateBulkMailingDialog onSend={this._reloadMailings} />
	);
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		const isActiveChallenge = this.context.challenge.isActiveChallenge;
		this.state = {
			userStats: context.api.getUserStats(userStats => {
				this.setState({ userStats });
			}),
			challengeResponseTotals: (
				isActiveChallenge ?
					this.context.api.getChallengeResponseActionTotals(
						this.context.challenge.activeChallenge.id,
						challengeResponseTotals => {
							this.setState({ challengeResponseTotals });
						}
					) :
					{ isLoading: false, value: [] }
			),
			challengeWinners: (
				isActiveChallenge ?
					this.context.api.getChallengeWinners(
						this.context.challenge.activeChallenge.id,
						challengeWinners => {
							this.setState({ challengeWinners });
						}
					) :
					{ isLoading: false, value: [] }
			),
			mailings: context.api.getBulkMailings(mailings => {
				this.setState({ mailings });
			})
		};
	}
	public componentWillMount() {
		this.context.page.setTitle(title);
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._goToHome);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._goToHome);
	}
	public render() {
		return (
			<Page className="admin-page" title={title}>
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
			</Page>
		);
	}
}