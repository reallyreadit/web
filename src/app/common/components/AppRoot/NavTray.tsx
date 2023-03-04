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
import ScreenKey from '../../../../common/routing/ScreenKey';
import UserAccount, {
	hasAnyAlerts,
} from '../../../../common/models/UserAccount';
import { Screen } from '../Root';
import Alert from '../../../../common/models/notifications/Alert';

interface Props {
	onViewContenders: () => void;
	onViewHome: () => void;
	onViewMyFeed: () => void;
	onViewMyReads: () => void;
	selectedScreen: Screen;
	user: UserAccount;
}
export default class NavTray extends React.PureComponent<Props> {
	public render() {
		return (
			<ol className="nav-tray_2tc8">
				<li>
					<button
						className={
							this.props.selectedScreen.key === ScreenKey.Home
								? 'selected'
								: null
						}
						onClick={this.props.onViewHome}
					>
						<Icon
							badge={hasAnyAlerts(this.props.user, Alert.Aotd) ? 1 : 0}
							name="trophy"
						/>
						<label>AOTD</label>
					</button>
				</li>
				<li>
					<button
						className={
							this.props.selectedScreen.key === ScreenKey.Contenders
								? 'selected'
								: null
						}
						onClick={this.props.onViewContenders}
					>
						<Icon name="podium" />
						<label>Contenders</label>
					</button>
				</li>
				<li>
					<button
						className={
							this.props.selectedScreen.key === ScreenKey.MyReads
								? 'selected'
								: null
						}
						onClick={this.props.onViewMyReads}
					>
						<Icon name="star" />
						<label>My Reads</label>
					</button>
				</li>
				<li>
					<button
						className={
							this.props.selectedScreen.key === ScreenKey.MyFeed
								? 'selected'
								: null
						}
						onClick={this.props.onViewMyFeed}
					>
						<Icon badge={this.props.user.followerAlertCount} name="candy" />
						<label>My Feed</label>
					</button>
				</li>
			</ol>
		);
	}
}
