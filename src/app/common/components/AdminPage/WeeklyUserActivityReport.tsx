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
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import DateRangeQuery from '../../../../common/models/analytics/DateRangeQuery';
import { ReportTable } from './ReportTable';
import { DateTime, Duration } from 'luxon';
import { WeeklyUserActivityReport as WeeklyUserActivityReportRow } from '../../../../common/models/analytics/WeeklyUserActivityReport';

interface Props {
	onGetWeeklyUserActivityReport: FetchFunctionWithParams<DateRangeQuery, WeeklyUserActivityReportRow[]>
}
function formatReadingTime(minutes: number) {
	return Duration
		.fromObject({
			minutes
		})
		.toFormat("hh':'mm");
}
function getHeaders() {
	return [
		[
			{
				name: 'Week'
			},
			{
				name: 'Active Users'
			},
			{
				name: 'People Reading'
			},
			{
				name: 'Time Reading'
			},
			{
				name: 'Time Reading to Completion'
			}
		]
	];
}
function renderBody(data: WeeklyUserActivityReportRow[]) {
	if (!data.length) {
		return null;
	}
	return (
		<tbody>
			{data.map(
				row => (
					<tr key={row.week}>
						<td className="align-center">{row.week.replace(/T00:00:00$/, '')}</td>
						<td className="align-right">{row.activeUserCount}</td>
						<td className="align-right">{row.activeReaderCount}</td>
						<td className="align-right">{formatReadingTime(row.minutesReading)}</td>
						<td className="align-right">{formatReadingTime(row.minutesReadingToCompletion)}</td>
					</tr>
				)
			)}
		</tbody>
	);
}
export class WeeklyUserActivityReport extends React.Component<Props> {
	private readonly _initialStartDate: string;
	private readonly _initialEndDate: string;
	constructor(props: Props) {
		super(props);
		const
			localNow = DateTime.local(),
			localNowDate = DateTime
				.fromObject({
					year: localNow.year,
					month: localNow.month,
					day: localNow.day,
					zone: 'utc'
				});
		this._initialStartDate = localNowDate
			.minus({
				days: localNowDate.weekday + (7 * 11)
			})
			.toISO({
				suppressMilliseconds: true,
				includeOffset: false
			});
		this._initialEndDate = localNowDate
			.minus({
				days: localNowDate.weekday
			})
			.toISO({
				suppressMilliseconds: true,
				includeOffset: false
			});
	}
	public render() {
		return (
			<ReportTable
				title="Weekly Reading Activity"
				initialStartDate={this._initialStartDate}
				initialEndDate={this._initialEndDate}
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetWeeklyUserActivityReport}
				onRenderBody={renderBody}
			/>
		);
	}
}