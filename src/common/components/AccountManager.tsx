import * as React from 'react';
import Button from './Button';
import ActionLink from './ActionLink';
import Separator from './Separator';
import * as className from 'classnames';

export default (props: {
	userName: string,
	showNewReplyIndicator: boolean,
	isSigningOut?: boolean
	onSignIn: () => void,
	onSignOut: () => void,
	onCreateAccount: () => void,
	onGoToInbox: () => void,
	onGoToReadingList: () => void,
	onGoToSettings: () => void
}) => {
	const buttonState = props.isSigningOut ? 'disabled' : 'normal';
	return (
		props.userName ?
			<div className="account-manager">
				<div className={className('user-name', { 'signing-out': props.isSigningOut })}>
					<div>
						<span>{props.isSigningOut ? 'Later' : 'Sup'}, <strong>{props.userName}</strong></span>
						<Separator />
						<ActionLink text="Sign Out" iconLeft="switch" onClick={props.onSignOut} state={props.isSigningOut ? 'busy' : 'normal'} />
					</div>
				</div>
				<div className="buttons">
					<Button
						text="Inbox"
						iconLeft="envelope"
						onClick={props.onGoToInbox}
						state={buttonState}
						showIndicator={props.showNewReplyIndicator} />
					<Button text="Reading List" iconLeft="book" onClick={props.onGoToReadingList} state={buttonState} />
					<Button text="Settings" iconLeft="cog" onClick={props.onGoToSettings} state={buttonState} />
				</div>
			</div> :
			<div className="account-manager">
				<div className="buttons">
					<Button text="Sign In" iconLeft="user" onClick={props.onSignIn} />
					<Button text="Create Account" iconLeft="plus" onClick={props.onCreateAccount} style="preferred" />
				</div>
			</div>
	);
};