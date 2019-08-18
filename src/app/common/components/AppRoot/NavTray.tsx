import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import UserAccount from '../../../../common/models/UserAccount';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import { Screen } from '../Root';

const profileRoute = findRouteByKey(routes, ScreenKey.Profile);
interface Props {
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewMyReads: () => void,
	onViewProfile: () => void,
	onViewStats: () => void,
	selectedScreen: Screen,
	user: UserAccount
}
export default class NavTray extends React.PureComponent<Props>{
	// needed so that the <button> this ref isn't passed as a parameter
	private readonly _viewProfile = () => {
		this.props.onViewProfile();
	};
	public render() {
		return (
			<ol className="nav-tray_2tc8">
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.Home ? 'selected' : null}
						onClick={this.props.onViewHome}
					>
						<Icon name="earth" />
						<label>Discover</label>
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
						className={
							(
								this.props.selectedScreen.key === ScreenKey.Profile &&
								profileRoute.getPathParams(this.props.selectedScreen.location.path)['userName'].toLowerCase() === this.props.user.name.toLowerCase()
							) ?
								'selected' :
								null
						}
						onClick={this._viewProfile}
					>
						<Icon name="user" />
						<label>Profile</label>
					</button>
				</li>
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.Stats ? 'selected' : null}
						onClick={this.props.onViewStats}
					>
						<Icon name="line-chart" />
						<label>Stats</label>
					</button>
				</li>
				<li>
					<button
						className={this.props.selectedScreen.key === ScreenKey.Leaderboards ? 'selected' : null}
						onClick={this.props.onViewLeaderboards}
					>
						<Icon name="podium" />
						<label>Leaderboards</label>
					</button>
				</li>
			</ol>
		);
	}
}