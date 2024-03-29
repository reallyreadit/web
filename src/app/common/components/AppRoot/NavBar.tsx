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
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import UserAccount, {
	hasAnyAlerts,
} from '../../../../common/models/UserAccount';
import { Screen, NavReference, NavOptions } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';

const leaderboardsUrl = findRouteByKey(routes, ScreenKey.Leaderboards).createUrl(),
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myFeedUrl = findRouteByKey(routes, ScreenKey.MyFeed).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl();

interface Props {
	onNavTo: (ref: NavReference, options: NavOptions) => void;
	onViewLeaderboards: () => void;
	onViewHome: () => void;
	onViewMyFeed: () => void;
	onViewMyReads: () => void;
	selectedScreen: Screen;
	user: UserAccount | null;
}
export default class NavBar extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="nav-bar_3e49ke">
				<ol>
					<li>
						<Button
							badge={this.props.user && hasAnyAlerts(this.props.user, Alert.Aotd) ? 1 : 0}
							href={homeUrl}
							onClick={this.props.onViewHome}
							state={
								this.props.selectedScreen.key === ScreenKey.Home
									? 'selected'
									: 'normal'
							}
							iconLeft="trophy"
							text="AOTD"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={leaderboardsUrl}
							onClick={this.props.onViewLeaderboards}
							state={
								this.props.selectedScreen.key === ScreenKey.Leaderboards
									? 'selected'
									: 'normal'
							}
							iconLeft="podium"
							text="Leaderboards"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={myReadsUrl}
							onClick={this.props.onViewMyReads}
							state={
								this.props.selectedScreen.key === ScreenKey.MyReads
									? 'selected'
									: 'normal'
							}
							iconLeft="star"
							text="My Reads"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={myFeedUrl}
							badge={this.props.user?.followerAlertCount ?? 0}
							onClick={this.props.onViewMyFeed}
							state={
								this.props.selectedScreen.key === ScreenKey.MyFeed
									? 'selected'
									: 'normal'
							}
							iconLeft="group-circle"
							text="My Feed"
							size="x-large"
							display="block"
						/>
					</li>
				</ol>
				<div className="footer"></div>
			</div>
		);
	}
}
