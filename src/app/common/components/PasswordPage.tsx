import * as React from 'react';
import { Screen } from './Root';
import routes from '../../../common/routing/routes';
import { findRouteByKey } from '../../../common/routing/Route';
import ScreenKey from '../../../common/routing/ScreenKey';

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
export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onGetScreenState: (key: TScreenKey) => Screen
}) {
	return {
		create: (location: Location) => ({ key, location }),
		render: () => {
			const [, action, result] = deps
				.onGetScreenState(key)
				.location.path
				.match(findRouteByKey(routes, ScreenKey.Password).pathRegExp);
			return (
				<PasswordPage
					action={action}
					result={result}
				/>
			);
		}
	};
}
interface Props {
	action: string,
	result: string
}
export default class PasswordPage extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="password-page">
				<strong>
					{resultMessages[this.props.action][this.props.result]}
				</strong>
			</div>
		);
	}
}