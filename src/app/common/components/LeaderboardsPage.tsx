import * as React from 'react';

export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: () => ({ key, title: 'Leaderboards' }),
		render: () => (
			<LeaderboardsPage />
		)
	};
}
export default class LeaderboardsPage extends React.PureComponent {
	public render() {
		return (
			<div className="leaderboards-page_872eby">Leaderboards!</div>
		);
	}
}