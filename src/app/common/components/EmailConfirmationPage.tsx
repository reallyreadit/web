import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import * as className from 'classnames';
import { Intent } from '../Page';

const resultMessages: {
	[key: string]: {
		text: string,
		intent: Intent
	}
} = {
	'not-found': {
		text: 'The email confirmation id apprears to be invalid.',
		intent: Intent.Danger
	},
	'expired': {
		text: 'This email confirmation has expired. Please check your inbox for a more recent confirmation.',
		intent: Intent.Danger
	},
	'already-confirmed': {
		text: 'This email address has already been confirmed.',
		intent: Intent.Success
	},
	'success': {
		text: 'Thanks for confirming your email address!',
		intent: Intent.Success
	}
};
export default class extends React.PureComponent<RouteComponentProps<{ result: string }>, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	public componentWillMount() {
		this.context.page.setState({
			title: 'Email Confirmation',
			isLoading: false,
			isReloadable: false
		});
	}
	public render() {
		return (
			<div className="email-confirmation-page">
				<strong className={className({ 'success': resultMessages[this.props.match.params.result].intent === Intent.Success })}>
					{resultMessages[this.props.match.params.result].text}
				</strong>
			</div>
		);
	}
}