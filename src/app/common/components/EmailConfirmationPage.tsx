import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import * as className from 'classnames';

const resultMessages: { [key: string]: string } = {
	'notFound': 'The email confirmation id apprears to be invalid.',
	'expired': 'This email confirmation has expired. Please check your inbox for a more recent confirmation.',
	'alreadyConfirmed': 'This email address has already been confirmed.',
	'success': 'Thanks for confirming your email address!'
};
export default class EmailConfirmationPage extends PureContextComponent<{
	params: {
		result: string
	}
}, {}> {
	public componentWillMount() {
		this.context.pageTitle.set('Email Confirmation');
	}
	public render() {
		return (
			<div className="email-confirmation-page">
				<strong className={className({ 'success': ['alreadyConfirmed', 'success'].indexOf(this.props.params.result) > -1 })}>
					{resultMessages[this.props.params.result]}
				</strong>
			</div>
		);
	}
}