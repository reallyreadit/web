import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';
import UserAccount from '../../../../common/models/UserAccount';

interface Props {
	user: UserAccount
}
class MyFeedScreen extends React.Component {
	public render() {
		return (
			<div className="my-feed-screen_921ddo">
				My feed screen.
			</div>
		);
	}
}
export default function createMyFeedScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'My Feed' }),
		render: (screen: Screen, sharedState: SharedState) => (
			<MyFeedScreen {
				...{
					...deps,
					user: sharedState.user
				}
			} />
		)
	};
}