
import * as React from 'react';
import BlogScreen, { Props } from '../screens/BlogScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';

export default function createBlogScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'From the Readup Blog' }),
		render: (state: Screen, sharedState: SharedState) => (
			<BlogScreen
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