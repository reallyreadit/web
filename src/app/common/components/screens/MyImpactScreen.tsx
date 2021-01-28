import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';

class MyImpactScreen extends React.Component {
	public render() {
		return (
			<ScreenContainer className="my-impact-screen_n8wfkf">
				<h1>Pie Chart, etc.</h1>
			</ScreenContainer>
		);
	}
}
export function createMyImpactScreenFactory<TScreenKey>(
	key: TScreenKey
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'My Impact'
		}),
		render: () => (
			<MyImpactScreen />
		)
	};
}