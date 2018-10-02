import * as React from 'react';
import Icon from '../../../../common/components/Icon';
import classNames from 'classnames';
import ScreenKey from '../../ScreenKey';

export default class extends React.PureComponent<{
	onViewHistory: () => void,
	onViewHome: () => void,
	onViewLeaderboards: () => void,
	onViewStarred: () => void,
	selectedScreenKey: ScreenKey
}, {}> {
	public render() {
		return (
			<ol className="browser-nav">
				<li className={classNames(
					'nav-item',
					{ 'selected': this.props.selectedScreenKey === ScreenKey.Home }
				)}>
					<button onClick={this.props.onViewHome}>
						<Icon name="home" />
						<label>Home</label>
					</button>
				</li>
				<li className={classNames(
					'nav-item',
					{ 'selected': this.props.selectedScreenKey === ScreenKey.Starred }
				)}>
					<button onClick={this.props.onViewStarred}>
						<Icon name="star" />
						<label>Starred</label>
					</button>
				</li>
				<li className={classNames(
					'nav-item',
					{ 'selected': this.props.selectedScreenKey === ScreenKey.History }
				)}>
					<button onClick={this.props.onViewHistory}>
						<Icon name="clock" />
						<label>History</label>
					</button>
				</li>
				<li className={classNames(
					'nav-item',
					{ 'selected': this.props.selectedScreenKey === ScreenKey.Leaderboards }
				)}>
					<button onClick={this.props.onViewLeaderboards}>
						<Icon name="line-chart" />
						<label>Leaderboards</label>
					</button>
				</li>
			</ol>
		);
	}
}