import * as React from 'react';
import { NavOptions, Screen } from '../Root';
import Icon, { IconName } from '../../../../common/components/Icon';
import UserAccount from '../../../../common/models/UserAccount';
import ScreenKey from '../../../../common/routing/ScreenKey';
import * as classNames from 'classnames';
import {findRouteByKey} from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';

export default (props: {
	content?: React.ReactNode,
	isTransitioningBack: boolean,
	onBack: () => void,
	onViewNotifications: () => void,
	onViewProfile: (userName?: string, options?: NavOptions) => void,
	onViewSettings: () => void,
	selectedRootScreen: Screen,
	currentScreen: Screen,
	titles: (React.ReactNode | null)[],
	user: UserAccount
}) => {
	let leftButton: {
		action: () => void,
		badge?: number,
		iconName: IconName
	};
	if (
		props.titles.length === 1 ||
		(props.titles.length === 2 && props.isTransitioningBack)
	) {
		leftButton = {
			action: props.onViewNotifications,
			badge: props.user.replyAlertCount,
			iconName: 'bell'
		};
	} else {
		leftButton = {
			action: props.onBack,
			iconName: 'chevron-left'
		};
	}
	return (
		<div className="header_q3p9go">
			<div
				className="left-content"
				onClick={leftButton.action}
			>
				{leftButton.action === props.onBack ?
					<Icon
						badge={leftButton.badge}
						name={leftButton.iconName}
					/> :
					// force new dom element to avoid animating badge
					<div
						className={
							classNames(
								'notification-icon-wrapper',
								{
									'selected': props.selectedRootScreen.key === ScreenKey.Notifications
								}
							)
						}
					>
						<Icon
							badge={leftButton.badge}
							name={leftButton.iconName}
						/>
					</div>}
			</div>
			<div className="title">{props.titles[props.titles.length - (props.isTransitioningBack ? 2 : 1)]}</div>
			<div className="right-content ">
				{props.content}

				<div
					className="menu-button notification-icon"
					onClick={props.onViewNotifications}
				>
					<Icon
						badge={props.user.replyAlertCount}
						name="bell"
					/>
				</div>
				{
					( (props.currentScreen.key === ScreenKey.Profile) &&
						findRouteByKey(routes, ScreenKey.Profile)
							.getPathParams(props.currentScreen.location.path)['userName'].toLowerCase()
							=== props.user.name.toLowerCase()
					) ?
						<div
							className="menu-button"
							onClick={props.onViewSettings}
						>
							<Icon
								name="gear2"
							/>
						</div>
					:
						(
							props.currentScreen.key !== ScreenKey.Settings &&
							props.currentScreen.key !== ScreenKey.Admin ) ?
							<div
								className="menu-button"
								onClick={(_) => props.onViewProfile(props.user.name)}
							>
								<Icon name="user" />
							</div>
						: null
				}
			</div>
		</div>
	);
};