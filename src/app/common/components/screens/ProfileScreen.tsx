import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';

interface Props { }
class ProfileScreen extends React.Component<Props> {
	public render() {
		return (
			<ScreenContainer className="profile-screen_1u1j1e">

			</ScreenContainer>
		)
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Props
) {
	return {
		create: (location: RouteLocation) => ({ key, location, title: 'Profile' }),
		render: () => (
			<ProfileScreen {...deps} />
		)
	};
}