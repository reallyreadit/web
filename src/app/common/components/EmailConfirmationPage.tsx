import * as React from 'react';
import classNames from 'classnames';
import { Intent } from './Toaster';
import { Screen } from './Root';
import Location from '../Location';
import { findRouteByKey } from '../Route';
import routes from '../routes';
import ScreenKey from '../ScreenKey';

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
export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onGetScreenState: (key: TScreenKey) => Screen
}) {
	return {
		create: (location: Location) => ({ key, location }),
		render: () => (
			<EmailConfirmationPage
				result={
					deps
						.onGetScreenState(key)
						.location.path
						.match(findRouteByKey(routes, ScreenKey.EmailConfirmation).pathRegExp)
						[1]
				}
			/>
		)
	};
}
interface Props {
	result: string
}
export default class EmailConfirmationPage extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="email-confirmation-page">
				<strong className={classNames({ 'success': resultMessages[this.props.result].intent === Intent.Success })}>
					{resultMessages[this.props.result].text}
				</strong>
			</div>
		);
	}
}