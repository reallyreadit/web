import * as React from 'react';
import { DateTime } from 'luxon';

export default class extends React.PureComponent<{
	day: number,
	level: number,
	timeZoneName: string
}> {
	private _intervalId: number | null = null;
	public componentDidMount() {
		this._intervalId = window.setInterval(
			() => {
				this.forceUpdate();
			},
			60 * 1000
		);
	}
	public componentWillUnmount() {
		window.clearInterval(this._intervalId);
		this._intervalId = null;
	}
	public render() {
		let message: string;
		if (this.props.day !== -1) {
			if (this.props.level === 0) {
				message = 'Read your first article to begin!';
			} else if (this.props.level === 10) {
				message = 'Congratulations, you\'re done!'
			} else if (this.props.day > this.props.level) {
				const now = DateTime
					.local()
					.setZone(this.props.timeZoneName);
				const remainingParts = now
					.plus({ days: 1 })
					.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
					.diff(now)
					.toFormat('h:m')
					.split(':');
				message = `You have ${remainingParts[0]}h ${remainingParts[1]}m left to read another article!`;
			} else {
				message = 'You\'re safe till tomorrow!';
			}
		}
		return (
			<div className="countdown-timer">
				<span>{message}</span>
			</div>
		)
	}
}