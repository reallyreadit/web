import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import UserAccount, {
	hasAnyAlerts,
} from '../../../../common/models/UserAccount';
import { Screen, NavReference, NavOptions, NavMethod } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';
import Link from '../../../../common/components/Link';
import { LeaderboardsViewParams } from '../screens/LeaderboardsScreen';

const homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl(),
	myFeedUrl = findRouteByKey(routes, ScreenKey.MyFeed).createUrl(),
	leaderboardsUrl = findRouteByKey(routes, ScreenKey.Leaderboards).createUrl();

interface Props {
	onNavTo: (ref: NavReference, options: NavOptions) => void;
	onViewHome: () => void;
	onViewMyReads: () => void;
	selectedScreen: Screen;
	user: UserAccount;
}
/**
 * Readup web desktop side navbar
 */
export default class NavBar extends React.PureComponent<Props> {
	private readonly _navTo = (ref: NavReference) => {
		this.props.onNavTo(ref, { method: NavMethod.ReplaceAll });
	};
	public render() {
		return (
			<div className="nav-bar_yh8orf">
				<ol>
					<li>
						<Button
							badge={hasAnyAlerts(this.props.user, Alert.Aotd) ? 1 : 0}
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
							badge={this.props.user.followerAlertCount}
							onClick={() =>
								this.props.onNavTo(
									{ key: ScreenKey.MyFeed },
									{ method: NavMethod.ReplaceAll }
								)
							}
							state={
								this.props.selectedScreen.key === ScreenKey.MyFeed
									? 'selected'
									: 'normal'
							}
							iconLeft="candy"
							text="My Feed"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={leaderboardsUrl}
							onClick={() =>
								this.props.onNavTo(
									{
										key: ScreenKey.Leaderboards,
										params: { view: LeaderboardsViewParams.Readers },
									},
									{ method: NavMethod.ReplaceAll }
								)
							}
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
				</ol>
				<div className="footer">
					<Link screen={ScreenKey.Blog} onClick={this._navTo}>
						Readup Blog
					</Link>
				</div>
			</div>
		);
	}
}
