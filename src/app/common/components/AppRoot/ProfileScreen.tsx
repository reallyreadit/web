import * as React from 'react';
import { ProfileScreen, Deps, getProps } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Deps, Exclude<keyof Deps, 'isDesktopDevice' | 'isIosDevice' | 'onCopyAppReferrerTextToClipboard' | 'onInstallExtension' | 'onSetScreenState' | 'screenId'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
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
						onSetScreenState: () => {},
						screenId: 0
					},
					state,
					sharedState
				)
			} />
		)
	};
}