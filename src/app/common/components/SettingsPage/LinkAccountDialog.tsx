import * as React from 'react';
import Dialog from '../../../../common/components/Dialog';
import FormField from '../../../common/components/controls/FormField';
import AuthServiceProvider from '../../../../common/models/auth/AuthServiceProvider';

interface Props {
	onCloseDialog: () => void,
	onLinkAuthServiceAccount: (provider: AuthServiceProvider) => Promise<void>
}
interface State {
	provider: AuthServiceProvider
}
export default class LinkAccountDialog extends React.PureComponent<Props, State> {
	private readonly _submit = () => {
		return this.props.onLinkAuthServiceAccount(this.state.provider);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			provider: AuthServiceProvider.Twitter
		};
	}
	public render() {
		return (
			<Dialog
				className="link-account-dialog_q2jc4k"
				onClose={this.props.onCloseDialog}
				onSubmit={this._submit}
				title="Link Account"
			>
				<FormField
					className="provider"
					label="Provider"
				>
					<select>
						<option>Twitter</option>
					</select>
				</FormField>
			</Dialog>
		);
	}
}