import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';

class MyContributionScreen extends React.Component {
	public render() {
		return (
			<ScreenContainer className="my-contribution-screen_jagh2k">
				<h1>Pie Chart, etc.</h1>
			</ScreenContainer>
		);
	}
}
export function createMyContributionScreenFactory<TScreenKey>(
	key: TScreenKey
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'My Contribution'
		}),
		render: () => (
			<MyContributionScreen />
		)
	};
}