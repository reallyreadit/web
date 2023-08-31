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
import Fetchable from '../../../common/Fetchable';
import EmailSubscriptionsRequest from '../../../common/models/EmailSubscriptionsRequest';
import AsyncTracker from '../../../common/AsyncTracker';
import { parseQueryString } from '../../../common/routing/queryString';
import { Screen } from './Root';
import RouteLocation from '../../../common/routing/RouteLocation';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import NotificationPreferencesControl from './controls/NotificationPreferencesControl';

interface Props {
	onGetEmailSubscriptions: (
		token: string,
		callback: (request: Fetchable<EmailSubscriptionsRequest>) => void
	) => Fetchable<EmailSubscriptionsRequest>;
	onUpdateEmailSubscriptions: (
		token: string,
		prefrence: NotificationPreference
	) => Promise<void>;
	token: string | null;
}
export function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'token'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'Notification Preferences'
			},
		}),
		render: (state: Screen) => (
			<EmailSubscriptionPage
				onGetEmailSubscriptions={deps.onGetEmailSubscriptions}
				onUpdateEmailSubscriptions={deps.onUpdateEmailSubscriptions}
				token={parseQueryString(state.location.queryString)['token']}
			/>
		),
	};
}
export default class EmailSubscriptionPage extends React.PureComponent<
	Props,
	{ request: Fetchable<EmailSubscriptionsRequest> }
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _saveChanges = (preference: NotificationPreference) => {
		return this.props.onUpdateEmailSubscriptions(this._token, preference);
	};
	private _token: string;
	constructor(props: Props) {
		super(props);
		if (props.token) {
			this._token = props.token;
			this.state = {
				request: props.onGetEmailSubscriptions(
					props.token,
					this._asyncTracker.addCallback((request) =>
						this.setState({ request })
					)
				),
			};
		} else {
			this._token = null;
			this.state = { request: null };
		}
	}
	public render() {
		return (
			<div className="email-subscriptions-page_tqh2pd">
				{this.state.request ? (
					this.state.request.isLoading ? (
						<span>Loading...</span>
					) : this.state.request.value.isValid ? (
						<>
							<div className="address">
								<span>
									Notification settings for:{' '}
									{this.state.request.value.emailAddress}
								</span>
							</div>
							<NotificationPreferencesControl
								preference={this.state.request.value.preference}
								onChangeNotificationPreference={this._saveChanges}
							/>
						</>
					) : (
						<strong>Invalid token</strong>
					)
				) : (
					<strong>Invalid token</strong>
				)}
			</div>
		);
	}
}
