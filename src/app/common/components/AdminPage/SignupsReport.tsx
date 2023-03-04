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
import { DateTime } from 'luxon';
import SignupsReportRow from '../../../../common/models/analytics/SignupsReportRow';

interface Props {
	onGetSignups: FetchFunctionWithParams<DateRangeQuery, SignupsReportRow[]>;
}
function getHeaders() {
	return [
		[
			{
				name: 'Date Created',
			},
			{
				name: 'Id',
			},
			{
				name: 'Name',
			},
			{
				name: 'Email',
			},
			{
				name: 'Time Zone Name',
			},
			{
				name: 'Client Mode',
			},
			{
				name: 'Referrer Url',
			},
			{
				name: 'Initial Path',
			},
			{
				name: 'Current Path',
			},
			{
				name: 'Action',
			},
			{
				name: 'Article Views',
			},
			{
				name: 'Article Reads',
			},
			{
				name: 'Date Subscribed',
			},
		],
	];
}
function renderBody(data: SignupsReportRow[]) {
	if (!data.length) {
		return null;
	}
	return (
		<tbody>
			{data.map((row) => (
				<tr key={row.id}>
					<td>{row.dateCreated}</td>
					<td>{row.id}</td>
					<td>{row.name}</td>
					<td>{row.email}</td>
					<td>{row.timeZoneName}</td>
					<td>{row.clientMode}</td>
					<td>{row.referrerUrl}</td>
					<td>{row.initialPath}</td>
					<td>{row.currentPath}</td>
					<td>{row.action}</td>
					<td>{row.articleViewCount}</td>
					<td>{row.articleReadCount}</td>
					<td>{row.dateSubscribed}</td>
				</tr>
			))}
		</tbody>
	);
}
export class SignupsReport extends React.Component<Props> {
	private readonly _initialStartDate: string;
	private readonly _initialEndDate: string;
	constructor(props: Props) {
		super(props);
		const localNow = DateTime.local(),
			localNowDate = DateTime.fromObject({
				year: localNow.year,
				month: localNow.month,
				day: localNow.day,
				zone: 'utc',
			});
		this._initialStartDate = localNowDate
			.minus({
				days: 14,
			})
			.toISO({
				suppressMilliseconds: true,
				includeOffset: false,
			});
		this._initialEndDate = localNowDate
			.plus({
				days: 1,
			})
			.toISO({
				suppressMilliseconds: true,
				includeOffset: false,
			});
	}
	public render() {
		return (
			<ReportTable
				title="Signups"
				initialStartDate={this._initialStartDate}
				initialEndDate={this._initialEndDate}
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetSignups}
				onRenderBody={renderBody}
			/>
		);
	}
}
