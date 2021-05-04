import * as React from 'react';
import UserAccount from '../../../../common/models/UserAccount';
import Icon from '../../../../common/components/Icon';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import classNames from 'classnames';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from '../../../../common/components/Button';
import { Screen } from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import { RevenueMeter } from '../RevenueMeter';
import { RevenueReportResponse } from '../../../../common/models/subscriptions/RevenueReport';
import Fetchable from '../../../../common/Fetchable';

interface Props {
	isClosing: boolean,
	onClose: () => void,
	onClosed: () => void,
	onViewAdminPage: () => void,
	onViewBlog: () => void,
	onViewFaq: () => void,
	onViewLeaderboards: () => void,
	onViewProfile: () => void,
	onViewSearch: () => void,
	onViewSettings: () => void,
	onViewStats: () => void,
	revenueReport: Fetchable<RevenueReportResponse>,
	selectedScreen: Screen,
	userAccount: UserAccount | null
}
export default class extends React.PureComponent<Props> {
	private readonly _handleAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'menu_fk9ujy-drawer-close') {
			this.props.onClosed();
		}
	};
	private readonly _stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};
	private readonly _viewProfile = () => {
		this.props.onViewProfile();
	};
	constructor(props: Props) {
		super(props);
		this.state = { isSigningOut: false };
	}
	public render() {
		return (
			<div
				className={classNames('menu_fk9ujy', { 'closing': this.props.isClosing })}
				onAnimationEnd={this._handleAnimationEnd}
				onClick={this.props.onClose}
			>
				<div
					className="drawer"
					onClick={this._stopPropagation}
				>
					<div className="header">
						<label>{this.props.userAccount.name}</label>
						<div
							className="close-button"
							onClick={this.props.onClose}
						>
							<Icon name="cancel" />
						</div>
					</div>
					<ol>
						{this.props.userAccount.role === UserAccountRole.Admin ?
							<li>
								<Button
									state={this.props.selectedScreen.key === ScreenKey.Admin ? 'selected' : 'normal'}
									onClick={this.props.onViewAdminPage}
									text="Admin"
									size="large"
									display="block"
								/>
							</li> :
							null}
						<li>
							<Button
								badge={this.props.userAccount.followerAlertCount}
								state={
									(
										this.props.selectedScreen.key === ScreenKey.Profile &&
										findRouteByKey(routes, ScreenKey.Profile).getPathParams(this.props.selectedScreen.location.path)['userName'].toLowerCase() === this.props.userAccount.name.toLowerCase()
									) ?
										'selected' :
										'normal'
								}
								onClick={this._viewProfile}
								text="My Profile"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Stats ? 'selected' : 'normal'}
								onClick={this.props.onViewStats}
								text="My Stats"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Search ? 'selected' : 'normal'}
								onClick={this.props.onViewSearch}
								text="Search"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Leaderboards ? 'selected' : 'normal'}
								onClick={this.props.onViewLeaderboards}
								text="Leaderboards"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Blog ? 'selected' : 'normal'}
								onClick={this.props.onViewBlog}
								text="Blog"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Faq ? 'selected' : 'normal'}
								onClick={this.props.onViewFaq}
								text="Help"
								size="large"
								display="block"
							/>
						</li>
						<li>
							<Button
								state={this.props.selectedScreen.key === ScreenKey.Settings ? 'selected' : 'normal'}
								onClick={this.props.onViewSettings}
								text="Settings"
								size="large"
								display="block"
							/>
						</li>
					</ol>
					<RevenueMeter report={this.props.revenueReport} />
				</div>
			</div>
		);
	}
}