import * as React from 'react';
import FieldsetDialog, { Props as FieldsetDialogProps, State } from '../controls/FieldsetDialog';
import Link from '../../../../common/components/Link';
import { Intent } from '../../../../common/components/Toaster';
import SelectList from '../../../../common/components/SelectList';
import { BulkMailingRequest, BulkMailingTestRequest, BulkEmailSubscriptionStatusFilter } from '../../../../common/models/BulkMailing';
import KeyValuePair from '../../../../common/KeyValuePair';

type SubscriptionStatusFilterOptionValue = BulkEmailSubscriptionStatusFilter | null;
type FreeForLifeFilterOptionValue = boolean | null;

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
	private _changeTestAddress = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ testAddress: e.currentTarget.value });
	private _sendTestEmail = () => {
		this.setState({ sendingTestEmail: true });
		this.props
			.onSendTest({
				subject: this.state.subject,
				body: this.state.body,
				subscriptionStatusFilter: this.state.subscriptionStatusFilter,
				freeForLifeFilter: this.state.freeForLifeFilter,
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
			testAddress: '',
			sendingTestEmail: false
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
			return this.props.onSend({
				subject: this.state.subject,
				body: this.state.body,
				subscriptionStatusFilter: this.state.subscriptionStatusFilter,
				freeForLifeFilter: this.state.freeForLifeFilter
			});
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