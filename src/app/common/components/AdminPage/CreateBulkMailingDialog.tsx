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
import FieldsetDialog, { Props as FieldsetDialogProps, State } from '../controls/FieldsetDialog';
import Link from '../../../../common/components/Link';
import { Intent } from '../../../../common/components/Toaster';
import SelectList from '../../../../common/components/SelectList';
import { BulkMailingRequest, BulkMailingTestRequest, BulkEmailSubscriptionStatusFilter } from '../../../../common/models/BulkMailing';
import KeyValuePair from '../../../../common/KeyValuePair';

type SubscriptionStatusFilterOptionValue = BulkEmailSubscriptionStatusFilter | null;
type FreeForLifeFilterOptionValue = boolean | null;

function nullIfEmpty(inputValue: string) {
	return inputValue.trim() !== '' ?
		inputValue :
		null;
}

const subscriptionStatusFilterOptions: KeyValuePair<string, SubscriptionStatusFilterOptionValue>[] = [
	{
		key: 'Any',
		value: null
	},
	{
		key: 'Currently Subscribed',
		value: BulkEmailSubscriptionStatusFilter.CurrentlySubscribed
	},
	{
		key: 'Never Subscribed',
		value: BulkEmailSubscriptionStatusFilter.NeverSubscribed
	},
	{
		key: 'Not Currently Subscribed',
		value: BulkEmailSubscriptionStatusFilter.NotCurrentlySubscribed
	}
];
const freeForlifeFilterOptions: KeyValuePair<string, FreeForLifeFilterOptionValue>[] = [
	{
		key: 'Any',
		value: null
	},
	{
		key: 'Free-for-life',
		value: true
	},
	{
		key: 'Not Free-for-life',
		value: false
	}
];
interface Props {
	onSend: (request: BulkMailingRequest) => Promise<void>,
	onSendTest: (request: BulkMailingTestRequest) => Promise<void>,
	onSent: () => void
}
export default class CreateBulkMailingDialog extends FieldsetDialog<void, Props, Partial<State> & {
	subject: string
	body: string,
	subscriptionStatusFilter: SubscriptionStatusFilterOptionValue,
	freeForLifeFilter: FreeForLifeFilterOptionValue,
	userCreatedAfterFilter: string,
	userCreatedBeforeFilter: string,
	testAddress: string,
	sendingTestEmail: boolean
}> {
	private _changeSubject = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ subject: e.currentTarget.value });
	private _changeBody = (e: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({ body: e.currentTarget.value });
	private _changeSubscriptionStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState({
			subscriptionStatusFilter: JSON.parse(e.target.value) as SubscriptionStatusFilterOptionValue
		});
	};
	private _changeFreeForLifeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState({
			freeForLifeFilter: JSON.parse(e.target.value) as FreeForLifeFilterOptionValue
		});
	};
	private _changeUserCreatedAfterFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			userCreatedAfterFilter: e.target.value
		});
	};
	private _changeUserCreatedBeforeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			userCreatedBeforeFilter: e.target.value
		});
	};
	private _changeTestAddress = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ testAddress: e.currentTarget.value });
	private _sendTestEmail = () => {
		this.setState({ sendingTestEmail: true });
		this.props
			.onSendTest({
				...this.getRequestFromState(),
				emailAddress: this.state.testAddress
			})
			.then(() => {
				this.props.onShowToast('Test email sent.', Intent.Success);
			})
			.catch((errors?: string[]) => {
				this.props.onShowToast(
					errors && errors[0] ?
						errors[0] :
						'Unknown Error',
					Intent.Danger
				);
			})
			.then(() => {
				this.setState({ sendingTestEmail: false });
			});
	};
	constructor(props: Props & FieldsetDialogProps) {
		super(
			{
				title: 'Create Bulk Mailing',
				submitButtonText: 'Send',
				successMessage: 'Mail sent.'
			},
			props
		);
		this.state = {
			...this.state,
			subject: '',
			body: '',
			subscriptionStatusFilter: null,
			freeForLifeFilter: null,
			userCreatedAfterFilter: '',
			userCreatedBeforeFilter: '',
			testAddress: '',
			sendingTestEmail: false
		};
	}
	private getRequestFromState(): BulkMailingRequest {
		return {
			subject: this.state.subject,
			body: this.state.body,
			subscriptionStatusFilter: this.state.subscriptionStatusFilter,
			freeForLifeFilter: this.state.freeForLifeFilter,
			userCreatedAfterFilter: nullIfEmpty(this.state.userCreatedAfterFilter),
			userCreatedBeforeFilter: nullIfEmpty(this.state.userCreatedBeforeFilter)
		};
	}
	protected renderFields() {
		return (
			<table className="create-bulk-mailing-dialog_bbvobo">
				<tbody>
					<tr>
						<th>Subscription Status</th>
						<td>
							<SelectList
								onChange={this._changeSubscriptionStatusFilter}
								options={
									subscriptionStatusFilterOptions.map(
										option => ({
											key: option.key,
											value: JSON.stringify(option.value)
										})
									)
								}
								value={
									JSON.stringify(this.state.subscriptionStatusFilter)
								}
							/>
						</td>
					</tr>
					<tr>
						<th>Free-for-life</th>
						<td>
							<SelectList
								onChange={this._changeFreeForLifeFilter}
								options={
									freeForlifeFilterOptions.map(
										option => ({
											key: option.key,
											value: JSON.stringify(option.value)
										})
									)
								}
								value={
									JSON.stringify(this.state.freeForLifeFilter)
								}
							/>
						</td>
					</tr>
					<tr>
						<th>User Created on or After</th>
						<td>
							<input type="text" value={this.state.userCreatedAfterFilter} onChange={this._changeUserCreatedAfterFilter} />
						</td>
					</tr>
					<tr>
						<th>User Created Before</th>
						<td>
							<input type="text" value={this.state.userCreatedBeforeFilter} onChange={this._changeUserCreatedBeforeFilter} />
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
							<div>
								<small><strong>Formatting:</strong></small><br />
								<small>Read links: [LINK_TEXT](read:ARTICLE_SLUG)</small>
							</div>
						</td>
					</tr>
					<tr className="test-email">
						<th>Test Email</th>
						<td>
							<input type="text" value={this.state.testAddress} onChange={this._changeTestAddress} />
							<Link
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
			this.props.onShowToast(error, Intent.Danger);
		}
		return [{ error }];
	}
	protected submitForm() {
		if (window.confirm('Really?')) {
			return this.props.onSend(
				this.getRequestFromState()
			);
		} else {
			return Promise.reject(['cancelled']);
		}
	}
	protected onSuccess() {
		this.props.onSent();
	}
	protected onError(errors: string[]) {
		if (!errors || !errors.length || errors[0] !== 'cancelled') {
			this.props.onShowToast(
				errors && errors.length ? errors[0] : 'Unknown Error -- Careful, mail may have been sent',
				Intent.Danger
			);
		}
	}
}