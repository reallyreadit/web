import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import BulkMailing from '../../../common/models/BulkMailing';
import Fetchable from '../api/Fetchable';
import ActionLink from '../../../common/components/ActionLink';
import CreateBulkMailingDialog from './AdminPage/CreateBulkMailingDialog';

export default class extends ContextComponent<
	RouteComponentProps<{}>,
	{ mailings: Fetchable<BulkMailing[]> }
> {
	private readonly _goToHome = () => this.context.router.history.push('/');
	private readonly _reload = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.getBulkMailings(mailings => {
			this.setState({ mailings });
			this.context.page.setState({ isLoading: false });
		});
	};
	private readonly _openCreateDialog = () => this.context.page.openDialog(
		<CreateBulkMailingDialog onSend={this._reload} />
	);
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = {
			mailings: context.api.getBulkMailings(mailings => {
				this.setState({ mailings });
				this.context.page.setState({ isLoading: false });
			})
		};
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Admin',
			isLoading: this.state.mailings.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._goToHome);
		this.context.page.addListener('reload', this._reload);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._goToHome);
		this.context.page.removeListener('reload', this._reload);
	}
	public render() {
		return (
			<div className="admin-page">
				<table>
					<caption>
						<div className="content">
							<strong>Bulk Mailings</strong>
							<ActionLink iconLeft="plus" text="Create" onClick={this._openCreateDialog} />
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