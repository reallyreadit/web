import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import { Screen } from '../Root';
import Alert from '../../../../common/models/notifications/Alert';
import { SubscriptionStatus, SubscriptionStatusType } from '../../../../common/models/subscriptions/SubscriptionStatus';

interface Props {
	onViewHome: () => void,
	onViewMyFeed: () => void,
	onViewMyImpact: () => void,
	onViewMyReads: () => void,
	selectedScreen: Screen,
	user: UserAccount,
	subscriptionStatus: SubscriptionStatus
}
export default class NavTray extends React.PureComponent<Props>{
	public render() {
		return (
			<ol className="nav-tray_2tc8">
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.Home ? 'selected' : null}
						onClick={this.props.onViewHome}
					>
						<Icon
							badge={hasAnyAlerts(this.props.user, Alert.Aotd) ? 1 : 0}
							name="earth"
						/>
						<label>Discover</label>
					</button>
				</li>
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.MyFeed ? 'selected' : null}
						onClick={this.props.onViewMyFeed}
					>
						<Icon name="candy" />
						<label>My Feed</label>
					</button>
				</li>
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.MyReads ? 'selected' : null}
						onClick={this.props.onViewMyReads}
					>
						<Icon name="star" />
						<label>My Reads</label>
					</button>
				</li>
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.MyImpact ? 'selected' : null}
						onClick={this.props.onViewMyImpact}
					>
						<Icon name={ this.props.subscriptionStatus.type === SubscriptionStatusType.NeverSubscribed ? "rocket" : "dollar" } />
						<label>{ this.props.subscriptionStatus.type === SubscriptionStatusType.NeverSubscribed ? "Free Trial" : "My Impact" }</label>
					</button>
				</li>
			</ol>
		);
	}
}