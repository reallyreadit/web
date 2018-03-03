import * as React from 'react';
import Button from './Button';

export default (props: {
	isSignedIn: boolean,
	state: 'normal' | 'disabled',
	showNewReplyIndicator: boolean,
	onSignIn: () => void,
	onCreateAccount: () => void,
	onGoToInbox: () => void,
	onGoToStarred: () => void,
	onGoToHistory: () => void
}) =>
	props.isSignedIn ?
		<div className="nav-bar">
			<Button
				text="Inbox"
				iconLeft="box"
				onClick={props.onGoToInbox}
				state={props.state}
				showIndicator={props.showNewReplyIndicator} />
			<Button text="Starred" iconLeft="star-empty" onClick={props.onGoToStarred} state={props.state} />
			<Button text="History" iconLeft="clock" onClick={props.onGoToHistory} state={props.state} />
		</div> :
		<div className="nav-bar">
			<Button text="Sign In" iconLeft="user" onClick={props.onSignIn} />
			<Button text="Create Account" iconLeft="plus" onClick={props.onCreateAccount} style="preferred" />
		</div>