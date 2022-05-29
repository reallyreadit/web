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
import ArticleIssuesReportRow from '../../../../common/models/analytics/ArticleIssuesReportRow';

interface Props {
	onGetArticleIssueReports: FetchFunctionWithParams<DateRangeQuery, ArticleIssuesReportRow[]>
}
function getHeaders() {
	return [
		[
			{
				name: 'User'
			},
			{
				name: 'Date Created'
			},
			{
				name: 'Client Type'
			},
			{
				name: 'Issue'
			},
			{
				name: 'URL'
			},
			{
				name: 'AOTD Rank'
			}
		]
	];
}
function renderBody(data: ArticleIssuesReportRow[]) {
	if (!data.length) {
		return null;
	}
	return (
		<tbody>
			{data.map(
				row => (
					<tr key={row.dateCreated}>
						<td>{row.userName}</td>
						<td>{row.dateCreated}</td>
						<td>{row.clientType}</td>
						<td>{row.issue}</td>
						<td>
							<a href={row.articleUrl}>{row.articleUrl}</a>
						</td>
						<td>{row.articleAotdContenderRank}</td>
					</tr>
				)
			)}
		</tbody>
	);
}
export class ArticleIssuesReport extends React.Component<Props> {
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
		this._initialEndDate = localNowDate
			.plus({
				days: 1
			})
			.toISO({
				suppressMilliseconds: true,
				includeOffset: false
			});
	}
	public render() {
		return (
			<ReportTable
				title="Article Issue Reports"
				initialStartDate={this._initialStartDate}
				initialEndDate={this._initialEndDate}
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetArticleIssueReports}
				onRenderBody={renderBody}
			/>
		);
	}
}