import * as React from 'react';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import { Screen } from '../Root';
import Button from '../../../../common/components/Button';
import Alert from '../../../../common/models/notifications/Alert';
import Separator from '../../../../common/components/Separator';

const
	homeUrl = findRouteByKey(routes, ScreenKey.Home).createUrl(),
	myReadsUrl = findRouteByKey(routes, ScreenKey.MyReads).createUrl(),
	profileRoute = findRouteByKey(routes, ScreenKey.Profile),
	leaderboardsUrl = findRouteByKey(routes, ScreenKey.Leaderboards).createUrl();

interface Props {
	onViewBlog: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyReads: () => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: (userName?: string) => void,
	selectedScreen: Screen,
	user: UserAccount
}
export default class NavBar extends React.PureComponent<Props> {
	private readonly _viewBlog = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewBlog();
	};
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	private readonly _viewProfile = () => {
		this.props.onViewProfile();
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
							state={this.props.selectedScreen.key === ScreenKey.Home ? 'selected' : 'normal'}
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
							state={this.props.selectedScreen.key === ScreenKey.MyReads ? 'selected' : 'normal'}
							iconLeft="star"
							text="My Reads"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							badge={this.props.user.followerAlertCount}
							href={profileRoute.createUrl({ userName: this.props.user.name })}
							onClick={this._viewProfile}
							state={
								(
									this.props.selectedScreen.key === ScreenKey.Profile &&
									profileRoute.getPathParams(this.props.selectedScreen.location.path)['userName'].toLowerCase() === this.props.user.name.toLowerCase()
								) ?
									'selected' :
									'normal'
							}
							iconLeft="user"
							text="Profile"
							size="x-large"
							display="block"
						/>
					</li>
					<li>
						<Button
							href={leaderboardsUrl}
							onClick={this.props.onViewLeaderboards}
							state={this.props.selectedScreen.key === ScreenKey.Leaderboards ? 'selected' : 'normal'}
							iconLeft="podium"
							text="Leaderboards"
							size="x-large"
							display="block"
						/>
					</li>
				</ol>
				<div className="footer">
					<a
						href={findRouteByKey(routes, ScreenKey.Blog).createUrl()}
						onClick={this._viewBlog}
					>
						Blog
					</a>
					<Separator />
					<a
						href={findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()}
						onClick={this._viewPrivacyPolicy}
					>
						Terms of Service
					</a>
					<br />
					<a href="mailto:support@readup.com">support@readup.com</a>
				</div>
			</div>
		);
	}
}