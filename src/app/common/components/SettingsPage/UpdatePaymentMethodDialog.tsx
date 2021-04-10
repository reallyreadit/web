import * as React from 'react';
import FormField from '../../../../common/components/controls/FormField';
import SelectList from '../../../../common/components/SelectList';
import { SubscriptionPaymentMethodUpdateRequest, SubscriptionPaymentMethodResponse, SubscriptionPaymentMethod } from '../../../../common/models/subscriptions/SubscriptionPaymentMethod';
import { Intent } from '../../../../common/components/Toaster';
import FieldsetDialog, { State as FieldsetDialogState } from '../controls/FieldsetDialog';

interface Props {
	paymentMethod: SubscriptionPaymentMethod,
	onCloseDialog: () => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onUpdatePaymentMethod: (request: SubscriptionPaymentMethodUpdateRequest) => Promise<SubscriptionPaymentMethodResponse>
}
interface State extends FieldsetDialogState {
	month: number,
	year: number
}
const
	monthOptions = Array
		.from({ length: 12 })
		.map(
			(_, i) => {
				const month = i + 1;
				return {
					key: month,
					value: month
				};
			}
		),
	thisYear = new Date().getFullYear(),
	yearOptions = Array
		.from({ length: 19 })
		.map(
			(_, i) => {
				const year = thisYear + i;
				return {
					key: year,
					value: year
				};
			}
		);
export class UpdatePaymentMethodDialog extends FieldsetDialog<SubscriptionPaymentMethodResponse, Props, State> {
	private readonly _changeMonth = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState({
			month: parseInt(event.currentTarget.value)
		});
	};
	private readonly _changeYear = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState({
			year: parseInt(event.currentTarget.value)
		});
	};
	constructor(props: Props) {
		super(
			{
				className: 'update-payment-method-dialog_pa287t',
				title: 'Update Card',
				submitButtonText: 'Save Changes',
				successMessage: 'Card updated.'
			},
			props
		);
		this.state = {
			...this.state,
			month: props.paymentMethod.expirationMonth,
			year: props.paymentMethod.expirationYear
		};
	}
	protected onError() {
		this.props.onShowToast('An unexpected error occurred.', Intent.Danger);
	}
	protected renderFields() {
		return (
			<>
				<FormField
					label="Exp. Month"
				>
					<SelectList
						onChange={this._changeMonth}
						options={monthOptions}
						value={this.state.month}
					/>
				</FormField>
				<FormField
					label="Exp. Year"
				>
					<SelectList
						onChange={this._changeYear}
						options={yearOptions}
						value={this.state.year}
					/>
				</FormField>
			</>
		);
	}
	protected submitForm() {
		return this.props.onUpdatePaymentMethod({
			id: this.props.paymentMethod.id,
			expirationMonth: this.state.month,
			expirationYear: this.state.year
		});
	}
}