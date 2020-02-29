import * as React from 'react';
import Dialog from '../../../../common/components/Dialog';
import FormField from '../../../common/components/controls/FormField';
import AuthServiceProvider from '../../../../common/models/auth/AuthServiceProvider';
import AuthServiceIntegration from '../../../../common/models/auth/AuthServiceIntegration';
import ToggleSwitchInput from '../../../../common/components/ToggleSwitchInput';

interface Props {
	onCloseDialog: () => void,
	onLinkAuthServiceAccount: (provider: AuthServiceProvider, integration: AuthServiceIntegration) => Promise<void>
}
interface State {
	integration: AuthServiceIntegration,
	provider: AuthServiceProvider
}
export default class LinkAccountDialog extends React.PureComponent<Props, State> {
	private readonly _submit = () => {
		return this.props.onLinkAuthServiceAccount(this.state.provider, this.state.integration);
	};
	private readonly _toggleIntegration = (value: string, isEnabled: boolean) => {
		this.setState({
			integration: (
				isEnabled ?
					AuthServiceIntegration.Post :
					AuthServiceIntegration.None
			)
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			integration: AuthServiceIntegration.Post,
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
				<ToggleSwitchInput
					className="integrations"
					isEnabled={this.state.integration === AuthServiceIntegration.Post}
					onChange={this._toggleIntegration}
					title="Tweet my Readup posts"
				/>
			</Dialog>
		);
	}
}