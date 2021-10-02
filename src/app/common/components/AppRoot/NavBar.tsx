import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import { Screen, NavReference, NavOptions } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';

const
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myImpactUrl = findRouteByKey(routes, ScreenKey.MyImpact).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl();

interface Props {
	onNavTo: (ref: NavReference, options: NavOptions) => void,
	onViewHome: () => void,
	onViewMyImpact: () => void,
	onViewMyReads: () => void,
	selectedScreen: Screen,
	user: UserAccount
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
						<Button
							href={myImpactUrl}
							onClick={this.props.onViewMyImpact}
							state={this.props.selectedScreen.key === ScreenKey.MyImpact ? 'selected' : 'normal'}
							iconLeft="dollar"
							text="My Impact"
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