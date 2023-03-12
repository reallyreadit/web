// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import { Interval, DateTime } from 'luxon';
import AsyncTracker from '../../../../../common/AsyncTracker';
import { pad } from '../../../../../common/format';

interface Props {
	timeZoneName: string;
}
export default class StreakTimer extends React.PureComponent<
	Props,
	{
		time: Interval | null;
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			time: null,
		};
	}
	private getInterval() {
		const now = DateTime.utc().setZone(this.props.timeZoneName);
		return now.until(
			now.plus({ days: 1 }).set({
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
			})
		);
	}
	public componentDidMount() {
		this.setState({
			time: this.getInterval(),
		});
		this._asyncTracker.addInterval(
			window.setInterval(() => {
				this.setState({
					time: this.getInterval(),
				});
			}, 1000)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="streak-timer_rs5zan">
				{this.state.time
					? Math.floor(this.state.time.length('hours')) +
					  ':' +
					  pad(
							(Math.floor(this.state.time.length('minutes')) % 60).toString(),
							'left',
							'0',
							2
					  ) +
					  ':' +
					  pad(
							(Math.floor(this.state.time.length('seconds')) % 60).toString(),
							'left',
							'0',
							2
					  )
					: null}
			</div>
		);
	}
}
