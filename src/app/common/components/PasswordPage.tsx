import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import Page from './Page';

const title = 'Password Reset Request';
const resultMessages: {
	[key: string]: {
		[key: string]: string
	}
} = {
	'reset': {
		'not-found': 'The password reset request id apprears to be invalid.',
		'expired': 'This password reset request has expired. Please generate a new request.'
	}
};
export default class PasswordPage extends React.PureComponent<RouteComponentProps<{
	action: string,
	result: string
}>, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	public componentWillMount() {
		this.context.page.setTitle(title);
	}
	public render() {
		return (
			<Page className="password-page" title={title}>
				<strong>
					{resultMessages[this.props.match.params.action][this.props.match.params.result]}
				</strong>
			</Page>
		);
	}
}