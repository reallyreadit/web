import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import { Screen, NavReference, NavOptions } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';
import {SubscriptionStatus} from '../../../../common/models/subscriptions/SubscriptionStatus';

const
	contendersUrl = findRouteByKey(routes, ScreenKey.Contenders).createUrl(),
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myFeedUrl = findRouteByKey(routes, ScreenKey.MyFeed).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl();

interface Props {
	onNavTo: (ref: NavReference, options: NavOptions) => void,
	onViewContenders: () => void,
	onViewHome: () => void,
	onViewMyFeed: () => void,
	onViewMyReads: () => void,
	selectedScreen: Screen,
	subscriptionStatus: SubscriptionStatus,
	user: UserAccount,
}
export default class NavBar extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="nav-bar_3e49ke">
				<ol>
					<li>
						<Button
							badge={hasAnyAlerts(this.props.user, Alert.Aotd) ? 1 : 0}
							href={homeUrl}
							onClick={this.props.onViewHome}
							state={this.props.selectedScreen.key === ScreenKey.Home ? 'selected' : 'normal'}
							iconLeft="trophy"
							text="AOTD"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={contendersUrl}
							onClick={this.props.onViewContenders}
							state={this.props.selectedScreen.key === ScreenKey.Contenders ? 'selected' : 'normal'}
							iconLeft="podium"
							text="Contenders"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={myReadsUrl}
							onClick={this.props.onViewMyReads}
							state={this.props.selectedScreen.key === ScreenKey.MyReads ? 'selected' : 'normal'}
							iconLeft="star"
							text="My Reads"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={myFeedUrl}
							badge={this.props.user.followerAlertCount}
							onClick={this.props.onViewMyFeed}
							state={this.props.selectedScreen.key === ScreenKey.MyFeed ? 'selected' : 'normal'}
							iconLeft="candy"
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
