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
import DailyTotalsReportRow from '../../../../common/models/analytics/DailyTotalsReportRow';
import { ReportTable, Header } from './ReportTable';
import { DateTime } from 'luxon';
import * as classNames from 'classnames';

interface Props {
	onGetDailyTotals: FetchFunctionWithParams<DateRangeQuery, DailyTotalsReportRow[]>
}
function addHeader(headers: Header[][], name: string, includeUnknown: boolean) {
	headers[1].push(
		{
			name: 'App'
		},
		{
			name: 'Browser'
		}
	);
	if (includeUnknown) {
		headers[0].push({
			name,
			colSpan: 3
		});
		headers[1].push({
			name: 'Unknown'
		});
	} else {
		headers[0].push({
			name,
			colSpan: 2
		});
	}
}
function getHeaders(data?: DailyTotalsReportRow[]) {
	const headers: Header[][] = [
		[{
			name: ''
		}],
		[{
			name: 'Date'
		}]
	];
	addHeader(
		headers,
		'Signups',
		data?.some(
			day => day.signupUnknownCount
		)
	);
	addHeader(
		headers,
		'Reads',
		data?.some(
			day => day.readUnknownCount
		)
	);
	addHeader(
		headers,
		'Posts',
		data?.some(
			day => day.postUnknownCount
		)
	);
	addHeader(
		headers,
		'Replies',
		data?.some(
			day => day.replyUnknownCount
		)
	);
	headers[0].push(
		{
			name: 'Post Tweets',
			colSpan: 2
		},
		{
			name: 'Extensions',
			colSpan: 2
		},
		{
			name: 'Subscriptions',
			colSpan: 2
		}
	);
	headers[1].push(
		{
			name: 'App'
		},
		{
			name: 'Browser'
		},
		{
			name: 'Installed'
		},
		{
			name: 'Uninstalled'
		},
		{
			name: 'Active'
		},
		{
			name: 'Lapsed'
		}
	);
	return headers;
}
function renderBody(data: DailyTotalsReportRow[]) {
	if (!data.length) {
		return null;
	}
	return (
		<tbody>
			{data.map(
				row => (
					<tr key={row.day}>
						<td className="align-center">{row.day.replace(/T00:00:00$/, '')}</td>
						{renderCell(row.signupAppCount)}
						{renderCell(row.signupBrowserCount)}
						{data.some(
							day => day.signupUnknownCount
						) ?
							renderCell(row.signupUnknownCount) :
							null}
						{renderCell(row.readAppCount)}
						{renderCell(row.readBrowserCount)}
						{data.some(
							day => day.readUnknownCount
						) ?
							renderCell(row.readUnknownCount) :
							null}
						{renderCell(row.postAppCount)}
						{renderCell(row.postBrowserCount)}
						{data.some(
							day => day.postUnknownCount
						) ?
							renderCell(row.postUnknownCount) :
							null}
						{renderCell(row.replyAppCount)}
						{renderCell(row.replyBrowserCount)}
						{data.some(
							day => day.replyUnknownCount
						) ?
							renderCell(row.replyUnknownCount) :
							null}
						{renderCell(row.postTweetAppCount)}
						{renderCell(row.postTweetBrowserCount)}
						{renderCell(row.extensionInstallationCount)}
						{renderCell(row.extensionRemovalCount)}
						{renderCell(row.subscriptionsActiveCount)}
						{renderCell(row.subscriptionLapseCount)}
					</tr>
				)
			)}
		</tbody>
	);
}
function renderCell(value: number) {
	return (
		<td className={classNames('align-center', { 'null': value === 0 })}>{value}</td>
	);
}
export class DailyTotalsReport extends React.Component<Props> {
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
				days: 14
			})
			.toISO({
				suppressMilliseconds: true,
				includeOffset: false
			});
		this._initialEndDate = localNowDate.toISO({
			suppressMilliseconds: true,
			includeOffset: false
		});
	}
	public render() {
		return (
			<ReportTable
				title="Daily Totals"
				initialStartDate={this._initialStartDate}
				initialEndDate={this._initialEndDate}
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetDailyTotals}
				onRenderBody={renderBody}
			/>
		);
	}
}