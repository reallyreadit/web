
import * as React from 'react';
import AotdHistoryScreen, { Props } from '../screens/AotdHistoryScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';

export default function createAotdHistoryScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Previous AOTD Winners' }),
		render: (state: Screen, sharedState: SharedState) => (
			<AotdHistoryScreen
				{
					...{
						...deps,
						user: sharedState.user
					}
				}
			/>
		)
	};
}