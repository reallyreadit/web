import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import * as className from 'classnames';
import { Intent } from '../Page';

const resultMessages: {
	[key: string]: {
		[key: string]: {
			text: string,
			intent: Intent
		}
	}
} = {
	'confirm': {
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
	},
	'unsubscribe': {
		'already-unsubscribed': {
			text: 'This email address has already been unsubscribed.',
			intent: Intent.Success
		},
		'success': {
			text: 'You have been unsubscribed successfully!',
			intent: Intent.Success
		}
	}
};
export default class EmailPage extends PureContextComponent<RouteComponentProps<{
	action: string,
	result: string
}>, {}> {
	public componentWillMount() {
		this.context.page.setState({
			title: 'Email ' + (this.props.match.params.action === 'confirm' ? 'Confirmation' : 'Notifications'),
			isLoading: false,
			isReloadable: false
		});
	}
	public render() {
		return (
			<div className="email-page">
				<strong className={className({ 'success': resultMessages[this.props.match.params.action][this.props.match.params.result].intent === Intent.Success })}>
					{resultMessages[this.props.match.params.action][this.props.match.params.result].text}
				</strong>
			</div>
		);
	}
}