
import * as React from 'react';
import AotdHistoryScreen, { Props } from '../screens/AotdHistoryScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';

function noop() { }
export default function createAotdHistoryScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'isIosDevice' | 'onCopyAppReferrerTextToClipboard' | 'onOpenCreateAccountDialog' | 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Previous AOTD Winners' }),
		render: (state: Screen, sharedState: SharedState) => (
			<AotdHistoryScreen
				{
					...{
						...deps,
						isIosDevice: true,
						onCopyAppReferrerTextToClipboard: noop,
						onOpenCreateAccountDialog: noop,
						user: sharedState.user
					}
				}
			/>
		)
	};
}