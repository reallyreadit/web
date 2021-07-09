import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import DateRangeQuery from '../../../../common/models/analytics/DateRangeQuery';
import { ReportTable } from './ReportTable';
import { DateTime } from 'luxon';
import ConversionsReportRow from '../../../../common/models/analytics/ConversionsReportRow';
import * as classNames from 'classnames';

interface Props {
	onGetConversions: FetchFunctionWithParams<DateRangeQuery, ConversionsReportRow[]>
}
function getHeaders() {
	return [
		[
			{
				name: ''
			},
			{
				name: ''
			},
			{
				name: 'Account Creations',
				colSpan: 2
			},
			{
				name: 'First Time Viewers',
				colSpan: 2
			},
			{
				name: 'First Time Readers',
				colSpan: 2
			}
		],
		[
			{
				name: 'Week'
			},
			{
				name: 'Visitors'
			},
			{
				name: 'Count'
			},
			{
				name: 'Conversion'
			},
			{
				name: 'Count'
			},
			{
				name: 'Conversion'
			},
			{
				name: 'Count'
			},
			{
				name: 'Conversion'
			}
		]
	];
}
function renderBody(data: ConversionsReportRow[]) {
	if (!data.length) {
		return null;
	}
	return (
		<tbody>
			{data.map(
				row => (
					<tr key={row.week}>
						<td className="align-center">{row.week.replace(/T00:00:00$/, '')}</td>
						{renderCell(row.visitorCount)}
						{renderCell(row.signupCount)}
						{renderCell(row.signupConversion, formatConversion)}
						{renderCell(row.articleViewerCount)}
						{renderCell(row.articleViewerConversion, formatConversion)}
						{renderCell(row.articleReaderCount)}
						{renderCell(row.articleReaderConversion, formatConversion)}
					</tr>
				)
			)}
		</tbody>
	);
}
function formatConversion(value: number) {
	return value.toFixed(2);
}
function renderCell(value: number, map?: (value: number) => string) {
	return (
		<td className={classNames('align-right', { 'null': value === 0 })}>
			{map ?
				map(value) :
				value}
		</td>
	);
}
export class ConversionsReport extends React.Component<Props> {
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
				title="Conversions"
				initialStartDate={this._initialStartDate}
				initialEndDate={this._initialEndDate}
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetConversions}
				onRenderBody={renderBody}
			/>
		);
	}
}