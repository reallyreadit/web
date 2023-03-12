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
import AsyncTracker, { CancellationToken } from '../AsyncTracker';
import AuthServiceProvider from '../models/auth/AuthServiceProvider';
import SpinnerIcon from './SpinnerIcon';
import * as classNames from 'classnames';

interface Props {
	onClick: (provider: AuthServiceProvider) => Promise<any> | void;
	provider: AuthServiceProvider;
	text?: string;
}
interface State {
	isSubmitting: boolean;
}
export default class AuthServiceButton extends React.PureComponent<
	Props,
	State
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _submit = () => {
		this.setState((prevState) => {
			if (prevState.isSubmitting) {
				return null;
			}
			const clickResult = this.props.onClick(this.props.provider);
			if (!clickResult) {
				return null;
			}
			this._asyncTracker
				.addPromise(clickResult)
				.then(this._stopSubmitting)
				.catch((reason) => {
					if ((reason as CancellationToken)?.isCancelled) {
						return;
					}
					this._stopSubmitting();
				});
			return {
				isSubmitting: true,
			};
		});
	};
	private readonly _stopSubmitting = () => {
		this.setState({
			isSubmitting: false,
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isSubmitting: false,
		};
	}
	private getContent() {
		let content: React.ReactNode;
		switch (this.props.provider) {
			case AuthServiceProvider.Apple:
				content = (
					<span className="content">
						 {this.props.text ?? 'Sign in with Apple'}
					</span>
				);
				break;
			case AuthServiceProvider.Twitter:
				content = (
					<span className="content">
						<span className="icon"></span>{' '}
						{this.props.text ?? 'Sign in with Twitter'}
					</span>
				);
				break;
		}
		return content;
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		let providerClass: string;
		switch (this.props.provider) {
			case AuthServiceProvider.Apple:
				providerClass = 'apple';
				break;
			case AuthServiceProvider.Twitter:
				providerClass = 'twitter';
				break;
		}
		return (
			<div
				className={classNames('auth-service-button_bj12nx', providerClass)}
				onClick={this._submit}
			>
				{this.state.isSubmitting ? <SpinnerIcon /> : this.getContent()}
			</div>
		);
	}
}
