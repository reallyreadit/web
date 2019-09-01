import * as React from 'react';
import { ProfileScreen, Deps, getProps } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, TemplateSection } from '../Root';
import { SharedState } from '../BrowserRoot';

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Deps, Exclude<keyof Deps, 'isIosDevice' | 'onSetScreenState'>> & {
		isDesktopDevice: boolean,
		onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void
	}
) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => {
		deps.onSetScreenState(key, getNextState);
	};
	return {
		create: (location: RouteLocation, sharedState: SharedState) => ({
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
						onSetScreenState: setScreenState
					},
					state,
					sharedState
				)
			} />
		)
	};
}