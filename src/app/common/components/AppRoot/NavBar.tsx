import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import { Screen, NavReference, NavOptions } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';
import {SubscriptionStatus, SubscriptionStatusType} from '../../../../common/models/subscriptions/SubscriptionStatus';

const
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	freeTrialUrl = findRouteByKey(routes, ScreenKey.FreeTrial).createUrl(),
	myImpactUrl = findRouteByKey(routes, ScreenKey.MyImpact).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl();

interface Props {
	onNavTo: (ref: NavReference, options: NavOptions) => void,
	onViewFreeTrial: () => void,
	onViewHome: () => void,
	onViewMyImpact: () => void,
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
							iconLeft="earth"
							text="Discover"
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
					{
						this.props.subscriptionStatus.type === SubscriptionStatusType.NeverSubscribed
						// SubscriptionStatusType.PaymentConfirmationRequired and SubscriptionStatusType.PaymentFailed
						// are already handled in MyImpactScreen
						 ?
						<Button
							href={freeTrialUrl}
							onClick={this.props.onViewFreeTrial}
							state={this.props.selectedScreen.key === ScreenKey.FreeTrial ? 'selected' : 'normal'}
							iconLeft="rocket"
							text="Free Trial"
							size="x-large"
							display="block"
						/>
						: <Button
							href={myImpactUrl}
							onClick={this.props.onViewMyImpact}
							state={this.props.selectedScreen.key === ScreenKey.MyImpact ? 'selected' : 'normal'}
							iconLeft="dollar"
							text="My Impact"
							size="x-large"
							display="block"
						/>
					}
					</li>
				</ol>
				<div className="footer"></div>
			</div>
		);
	}
}
