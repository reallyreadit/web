import * as React from 'react';
import Button from './Button';

export default (props: {
	isSignedIn: boolean,
	state: 'normal' | 'disabled',
	showNewReplyIndicator: boolean,
	onSignIn: () => void,
	onCreateAccount: () => void,
	onGoToInbox: () => void,
	onGoToReadingList: () => void,
	onGoToSettings: () => void
}) =>
	props.isSignedIn ?
		<div className="nav-bar">
			<Button
				text="Inbox"
				iconLeft="envelope"
				onClick={props.onGoToInbox}
				state={props.state}
				showIndicator={props.showNewReplyIndicator} />
			<Button text="Reading List" iconLeft="book" onClick={props.onGoToReadingList} state={props.state} />
			<Button text="Settings" iconLeft="cog" onClick={props.onGoToSettings} state={props.state} />
		</div> :
		<div className="nav-bar">
			<Button text="Sign In" iconLeft="user" onClick={props.onSignIn} />
			<Button text="Create Account" iconLeft="plus" onClick={props.onCreateAccount} style="preferred" />
		</div>