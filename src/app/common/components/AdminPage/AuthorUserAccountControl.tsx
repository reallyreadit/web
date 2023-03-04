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
import { AuthorUserAccountAssignmentRequest } from '../../../../common/models/authors/AuthorUserAccountAssignment';
import { Intent } from '../../../../common/components/Toaster';
import AsyncTracker, {
	CancellationToken,
} from '../../../../common/AsyncTracker';
import { getPromiseErrorMessage } from '../../../../common/format';

interface Props {
	onAssignUserAccountToAuthor: (
		request: AuthorUserAccountAssignmentRequest
	) => Promise<void>;
	onShowToast: (text: string, intent: Intent) => void;
}

interface State {
	authorSlug: string;
	isSubmitting: boolean;
	userName: string;
}

export class AuthorUserAccountControl extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeAuthorSlug = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		this.setState({
			authorSlug: event.target.value,
		});
	};
	private readonly _changeUserName = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		this.setState({
			userName: event.target.value,
		});
	};
	private readonly _submit = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		this.setState((currentState) => {
			// Make sure we're not already submitting.
			if (currentState.isSubmitting) {
				return null;
			}
			// Submit request.
			this._asyncTracker
				.addPromise(
					this.props.onAssignUserAccountToAuthor({
						authorSlug: currentState.authorSlug,
						userAccountName: currentState.userName,
					})
				)
				.then(() => {
					this.props.onShowToast('Action succeeded.', Intent.Success);
					this.setState({
						isSubmitting: false,
					});
				})
				.catch((reason) => {
					if ((reason as CancellationToken)?.isCancelled) {
						return;
					}
					this.props.onShowToast(getPromiseErrorMessage(reason), Intent.Danger);
					this.setState({
						isSubmitting: false,
					});
				});
			return {
				isSubmitting: true,
			};
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			authorSlug: '',
			isSubmitting: false,
			userName: '',
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<form className="author-user-account-control_hcskdm">
				<fieldset>
					<legend>Author User Account Assignment</legend>
					<label>
						<span>Author Slug</span>
						<input
							type="text"
							value={this.state.authorSlug}
							onChange={this._changeAuthorSlug}
							disabled={this.state.isSubmitting}
						/>
					</label>
					<label>Example: malcom-gladwell</label>
					<label>
						<span>User Account Name</span>
						<input
							type="text"
							value={this.state.userName}
							onChange={this._changeUserName}
							disabled={this.state.isSubmitting}
						/>
					</label>
					<label>Example: MalcomG</label>
				</fieldset>
				<button
					disabled={
						!this.state.authorSlug ||
						!this.state.userName ||
						this.state.isSubmitting
					}
					onClick={this._submit}
				>
					{this.state.isSubmitting ? 'Processing...' : 'Submit'}
				</button>
			</form>
		);
	}
}
