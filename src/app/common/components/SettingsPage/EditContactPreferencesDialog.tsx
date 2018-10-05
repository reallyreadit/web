import * as React from 'react';
import Dialog, { Props as DialogProps, State } from '../controls/Dialog';

interface Values {
	receiveWebsiteUpdates: boolean,
	receiveSuggestedReadings: boolean
}
interface Props extends Values {
	onUpdateContactPreferences: (receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) => Promise<void>
}
export default class extends Dialog<void, Props, Partial<State> & Values> {
	private _changeWebsiteUpdates = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveWebsiteUpdates: e.currentTarget.checked });
	private _changeSuggestedReadings = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveSuggestedReadings: e.currentTarget.checked });
	constructor(props: Props & DialogProps) {
		super(
			{
				title: 'Edit Contact Preferences',
				submitButtonText: 'Save Changes',
				successMessage: 'Contact preferences updated'
			},
			props
		);
		this.state = {
			...this.state,
			receiveWebsiteUpdates: props.receiveWebsiteUpdates,
			receiveSuggestedReadings: props.receiveSuggestedReadings
		};
	}
	protected renderFields() {
		return (
			<div className="edit-contact-preferences-dialog">
				Feel free to occasionally email me about the following:
				<ul>
					<li>
						<label>
							<input type="checkbox" checked={this.state.receiveWebsiteUpdates} onChange={this._changeWebsiteUpdates} />
							<span>Community updates</span>
						</label>
					</li>
					<li>
						<label>
							<input type="checkbox" checked={this.state.receiveSuggestedReadings} onChange={this._changeSuggestedReadings} />
							<span>Suggested readings</span>
						</label>
					</li>
				</ul>
			</div>
		);
	}
	protected submitForm() {
		return this.props.onUpdateContactPreferences(this.state.receiveWebsiteUpdates, this.state.receiveSuggestedReadings);
	}
}