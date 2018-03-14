import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import Separator from '../../../../common/components/Separator';
import Icon from '../../../../common/components/Icon';
import ResendConfirmationEmailActionLink from '../controls/ResendConfirmationEmailActionLink';

export default class extends React.PureComponent<{}, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	public componentDidMount() {
		this.context.user
			.addListener('authChange', this._forceUpdate)
			.addListener('update', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('authChange', this._forceUpdate)
			.removeListener('update', this._forceUpdate);
	}
	public render() {
		return (
		   this.context.user.isSignedIn && !this.context.user.userAccount.isEmailConfirmed ?
				<div className="email-confirmation-bar">
					<Icon name="exclamation" /> Please confirm your email address ({this.context.user.userAccount.email})<br />
					Need a new confirmation email?
					<Separator />
					<ResendConfirmationEmailActionLink /> 
				</div> :
				null
		);
	}
}