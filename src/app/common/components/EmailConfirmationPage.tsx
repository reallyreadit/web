// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import classNames from 'classnames';
import { Intent } from '../../../common/components/Toaster';
import { Screen } from './Root';
import RouteLocation from '../../../common/routing/RouteLocation';
import { findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import ScreenKey from '../../../common/routing/ScreenKey';

const resultMessages: {
	[key: string]: {
		text: string;
		intent: Intent;
	};
} = {
	'not-found': {
		text: 'The email confirmation id apprears to be invalid.',
		intent: Intent.Danger,
	},
	expired: {
		text: 'This email confirmation has expired. Please check your inbox for a more recent confirmation.',
		intent: Intent.Danger,
	},
	'already-confirmed': {
		text: 'This email address has already been confirmed.',
		intent: Intent.Success,
	},
	success: {
		text: 'Thanks for confirming your email address.',
		intent: Intent.Success,
	},
};
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'Email Confirmation'
			},
		}),
		render: (state: Screen) => (
			<EmailConfirmationPage
				result={
					state.location.path.match(
						findRouteByKey(routes, ScreenKey.EmailConfirmation).pathRegExp
					)[1]
				}
			/>
		),
	};
}
interface Props {
	result: string;
}
export default class EmailConfirmationPage extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="email-confirmation-page_9gvf3g">
				<strong
					className={classNames({
						success:
							resultMessages[this.props.result].intent === Intent.Success,
					})}
				>
					{resultMessages[this.props.result].text}
				</strong>
			</div>
		);
	}
}
