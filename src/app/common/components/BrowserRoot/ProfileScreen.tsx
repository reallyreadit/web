import * as React from 'react';
import { ProfileScreen, Deps, getProps } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, TemplateSection } from '../Root';
import { SharedState } from '../BrowserRoot';

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Deps, Exclude<keyof Deps, 'isIosDevice' | 'screenId'>> & {
		isDesktopDevice: boolean
	}
) {
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => ({
			id,
			key,
			location,
			templateSection: (
				sharedState.user && deps.isDesktopDevice ?
					null:
					TemplateSection.Header
			),
			title: 'Profile'
		}),
		render: (state: Screen, sharedState: SharedState) => (
			<ProfileScreen {
				...getProps(
					{
						...deps,
						isIosDevice: sharedState.isIosDevice,
						screenId: state.id
					},
					state,
					sharedState
				)
			} />
		)
	};
}