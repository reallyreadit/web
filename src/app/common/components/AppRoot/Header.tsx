import * as React from 'react';
import Icon, { IconName } from '../../../../common/components/Icon';
import UserAccount from '../../../../common/models/UserAccount';
import ScreenKey from '../../../../common/routing/ScreenKey';
import * as classNames from 'classnames';

export default (props: {
	content?: React.ReactNode,
	isTransitioningBack: boolean,
	onBack: () => void,
	onOpenMenu: () => void,
	onViewNotifications: () => void,
	selectedScreenKey: ScreenKey,
	titles: (React.ReactNode | null)[],
	user: UserAccount
}) => {
	let leftButton: {
		action: () => void,
		badge?: number,
		iconName: IconName
	};
	if (props.titles.length > 1 && !props.isTransitioningBack) {
		leftButton = {
			action: props.onBack,
			iconName: 'chevron-left'
		};
	} else {
		leftButton = {
			action: props.onViewNotifications,
			badge: props.user.replyAlertCount + props.user.postAlertCount + props.user.loopbackAlertCount,
			iconName: 'bell'
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
									'selected': props.selectedScreenKey === ScreenKey.Notifications
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
			<div className="right-content">
				{props.content}
				<div
					className="menu-button"
					onClick={props.onOpenMenu}
				>
					<Icon
						badge={props.user.followerAlertCount}
						name="user"
					/>
				</div>
			</div>
		</div>
	);
};