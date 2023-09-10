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
import Icon from '../../../../common/components/Icon';
import Button from '../../../../common/components/Button';
import Link from '../../../../common/components/Link';

interface Props {
	onRequestAuthorization: () => void;
	onSkip: () => void;
}
export default class NotificationsStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="notifications-step_uaqf5m">
				<h1>Stay connected.</h1>
				<h2>
					You'll always be in complete control of the types and frequency of
					notifications you receive.
				</h2>
				<Icon name="group-circle" />
				<Button
					intent="loud"
					onClick={this.props.onRequestAuthorization}
					size="large"
					text="Enable Notifications"
				/>
				<Link onClick={this.props.onSkip} text="Maybe Later" />
			</div>
		);
	}
}
