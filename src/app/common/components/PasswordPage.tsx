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
import { Screen } from './Root';
import routes from '../../../common/routing/routes';
import { findRouteByKey } from '../../../common/routing/Route';
import ScreenKey from '../../../common/routing/ScreenKey';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';

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
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Password Reset' }),
		render: (state: Screen) => {
			const [, action, result] = state.location.path
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
			<ScreenContainer>
				<div className="password-page_c48od1">
					<strong>
						{resultMessages[this.props.action][this.props.result]}
					</strong>
				</div>
			</ScreenContainer>
		);
	}
}