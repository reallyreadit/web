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
import FormDialog from '../../../../common/components/FormDialog';
import FormField from '../../../../common/components/controls/FormField';
import AuthServiceProvider from '../../../../common/models/auth/AuthServiceProvider';
import { Intent } from '../../../../common/components/Toaster';
import AuthServiceAccountAssociation from '../../../../common/models/auth/AuthServiceAccountAssociation';
import SelectList from '../../../../common/components/SelectList';

interface Props {
	onCloseDialog: () => void;
	onLinkAuthServiceAccount: (
		provider: AuthServiceProvider
	) => Promise<AuthServiceAccountAssociation>;
	onShowToast: (content: React.ReactNode, intent: Intent) => void;
}
interface State {
	provider: AuthServiceProvider;
}
export default class LinkAccountDialog extends React.PureComponent<
	Props,
	State
> {
	private readonly _changeProvider = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		this.setState({
			provider: parseInt(event.currentTarget.value) as AuthServiceProvider,
		});
	};
	private readonly _submit = () => {
		return this.props
			.onLinkAuthServiceAccount(this.state.provider)
			.then(() => {
				this.props.onShowToast('Account Linked', Intent.Success);
			})
			.catch((error) => {
				const errorMessage = (error as Error)?.message;
				if (errorMessage !== 'Unsupported') {
					let toastText: string, toastIntent: Intent;
					if (errorMessage === 'Cancelled') {
						toastText = 'Authentication Cancelled';
						toastIntent = Intent.Neutral;
					} else {
						toastText = 'Error: ' + (errorMessage ?? 'Unknown error') + '.';
						toastIntent = Intent.Danger;
					}
					this.props.onShowToast(toastText, toastIntent);
				}
				throw error;
			});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			provider: AuthServiceProvider.Twitter,
		};
	}
	public render() {
		return (
			<FormDialog
				className="link-account-dialog_q2jc4k"
				onClose={this.props.onCloseDialog}
				onSubmit={this._submit}
				title="Link Account"
			>
				<FormField className="provider" label="Provider">
					<SelectList
						onChange={this._changeProvider}
						options={[
							{
								key: 'Twitter',
								value: AuthServiceProvider.Twitter,
							},
						]}
						value={this.state.provider}
					/>
				</FormField>
				<div className="notice">We'll never post without your permission.</div>
			</FormDialog>
		);
	}
}
