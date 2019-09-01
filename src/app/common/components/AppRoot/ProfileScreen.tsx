import * as React from 'react';
import { ProfileScreen, Deps, getProps } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Icon from '../../../../common/components/Icon';
import { Screen, SharedState } from '../Root';

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Deps, Exclude<keyof Deps, 'isDesktopDevice' | 'isIosDevice' | 'onCopyAppReferrerTextToClipboard' | 'onInstallExtension' | 'onSetScreenState'>> & { onOpenMenu: () => void }
) {
	return {
		create: (location: RouteLocation) => ({
			key,
			location,
			title: 'Profile'
		}),
		render: (state: Screen, sharedState: SharedState) => (
			<ProfileScreen {
				...getProps(
					{
						...deps,
						isDesktopDevice: false,
						isIosDevice: true,
						onCopyAppReferrerTextToClipboard: () => {},
						onInstallExtension: () => {},
						onSetScreenState: () => {}
					},
					state,
					sharedState
				)
			} />
		),
		renderHeaderContent: () => (
			<div
				className="profile-screen_dci8co-header-content"
				onClick={deps.onOpenMenu}
			>
				<Icon name="menu2" />
			</div>
		)
	};
}