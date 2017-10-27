import * as React from 'react';
import Context from '../../Context';
import Dialog, { State } from '../Dialog';
import Fetchable from '../../api/Fetchable';
import ActionLink from '../../../../common/components/ActionLink';
import { Intent } from '../../Page';

interface Props { onSend: () => void }
export default class extends Dialog<{}, Props, Partial<State> & {
	lists: Fetchable<{ key: string, value: string }[]>,
	list: string,
	subject: string
	body: string,
	testAddress: string,
	sendingTestEmail: boolean
}> {
	private readonly _listPlaceholder = 'Loading...';
	private _changeList = (e: React.ChangeEvent<HTMLSelectElement>) => this.setState({ list: e.currentTarget.value });
	private _changeSubject = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ subject: e.currentTarget.value });
	private _changeBody = (e: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({ body: e.currentTarget.value });
	private _changeTestAddress = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ testAddress: e.currentTarget.value });
	private _sendTestEmail = () => {
		this.setState({ sendingTestEmail: true });
		this.context.api
			.sendTestBulkMailing(this.state.list, this.state.subject, this.state.body, this.state.testAddress)
			.then(() => this.context.page.showToast('Test email sent!', Intent.Success))
			.catch(() => this.context.page.showToast('Failed to send test email', Intent.Danger))
			.then(() => this.setState({ sendingTestEmail: false }));
	};
	constructor(props: Props, context: Context) {
		super(
			{
				title: 'Create Bulk Mailing',
				submitButtonText: 'Send',
				successMessage: 'Mail sent!'
			},
			props,
			context
		);
		const lists = context.api.getBulkMailingLists(lists => this.setState({ lists, list: lists.value[0].value }));
		this.state = {
			...this.state,
			lists,
			list: lists.isLoading ? this._listPlaceholder : lists.value[0].value,
			subject: '',
			body: '',
			testAddress: '',
			sendingTestEmail: false
		};
	}
	protected renderFields() {
		return (
			<table className="create-bulk-mailing-dialog">
				<tbody>
					<tr>
						<th>List</th>
						<td>
							<select value={this.state.list} onChange={this._changeList}>
								{!this.state.lists.isLoading ?
									this.state.lists.value.map(kvp => <option key={kvp.key} value={kvp.value}>{kvp.key}</option>) :
									<option disabled>{this._listPlaceholder}</option>}
							</select>
						</td>
					</tr>
					<tr>
						<th>Subject</th>
						<td>
							<input type="text" value={this.state.subject} onChange={this._changeSubject} />
						</td>
					</tr>
					<tr>
						<th>Body</th>
						<td>
							<textarea value={this.state.body} onChange={this._changeBody} />
						</td>
					</tr>
					<tr className="test-email">
						<th>Test Email</th>
						<td>
							<input type="text" value={this.state.testAddress} onChange={this._changeTestAddress} />
							<ActionLink
								iconLeft="checkmark"
								text="Send Test"
								onClick={this._sendTestEmail}
								state={this.state.sendingTestEmail ?
									'busy' :
									this.state.testAddress.indexOf('@') !== -1 ?
										'normal' :
										'disabled'}
							/>
						</td>
					</tr>
				</tbody>
			</table>
		);
	}
	protected getClientErrors() {
		let error: string = null;
		if (this.state.subject.trim() === '') {
			error = 'Subject is required';
		}
		if (this.state.body.trim() === '') {
			error = 'Body is required';
		}
		if (error) {
			this.context.page.showToast(error, Intent.Danger);
		}
		return [{ error }];
	}
	protected submitForm() {
		if (window.confirm('Really?')) {
			return this.context.api.sendBulkMailing(this.state.list, this.state.subject, this.state.body);
		} else {
			return Promise.reject(['cancelled']);
		}
	}
	protected onSuccess() {
		this.props.onSend();
	}
	protected onError(errors: string[]) {
		if (!errors || !errors.length || errors[0] !== 'cancelled') {
			this.context.page.showToast(
				errors && errors.length ? errors[0] : 'Unknown Error -- Careful, mail may have been sent',
				Intent.Danger
			);
		}
	}
}