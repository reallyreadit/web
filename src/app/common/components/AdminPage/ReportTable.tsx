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
import InputControl from '../../../../common/components/controls/InputControl';
import Button from '../../../../common/components/Button';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import DateRangeQuery from '../../../../common/models/analytics/DateRangeQuery';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';

export interface Header {
	name: string;
	colSpan?: number;
}
type BaseProps<TData> = {
	title: string;
	onGetHeaders: (data?: TData) => Header[][];
	onRenderBody: (data: TData, columnCount: number) => React.ReactNode | null;
	onRenderChart?: (data: TData) => React.ReactNode;
	onRenderFooter?: (data: TData, columnCount: number) => React.ReactNode;
};
type DateRangeQueryProps<TData> = BaseProps<TData> & {
	initialStartDate: string;
	initialEndDate: string;
	onFetchData: FetchFunctionWithParams<DateRangeQuery, TData>;
};
type UnknownQueryProps<TData> = BaseProps<TData> & {
	onFetchData: FetchFunctionWithParams<unknown, TData>;
};
type Props<TData> = DateRangeQueryProps<TData> | UnknownQueryProps<TData>;
function isDateRangeQueryProps<TData>(
	props: Props<TData>
): props is DateRangeQueryProps<TData> {
	return (
		typeof (props as DateRangeQueryProps<TData>).initialStartDate ===
			'string' &&
		typeof (props as DateRangeQueryProps<TData>).initialEndDate === 'string'
	);
}
interface State<TData> {
	startDate: string;
	endDate: string;
	data: Fetchable<TData> | null;
}
export class ReportTable<TData> extends React.Component<
	Props<TData>,
	State<TData>
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _runReport = (event: React.MouseEvent) => {
		event.preventDefault();
		const callback = this._asyncTracker.addCallback(
			(data: Fetchable<TData>) => {
				this.setState({
					data,
				});
			}
		);
		let data: Fetchable<TData>;
		if (isDateRangeQueryProps(this.props)) {
			data = this.props.onFetchData(
				{
					startDate: this.state.startDate,
					endDate: this.state.endDate,
				},
				callback
			);
		} else {
			data = this.props.onFetchData(null, callback);
		}
		this.setState({
			data,
		});
	};
	private readonly _setStartDate = (value: string) => {
		this.setState({
			startDate: value,
		});
	};
	private readonly _setEndDate = (value: string) => {
		this.setState({
			endDate: value,
		});
	};
	constructor(props: Props<TData>) {
		super(props);
		if (isDateRangeQueryProps(props)) {
			this.state = {
				data: null,
				startDate: props.initialStartDate,
				endDate: props.initialEndDate,
			};
		} else {
			this.state = {
				data: null,
				startDate: '',
				endDate: '',
			};
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const headers = this.props.onGetHeaders(this.state.data?.value),
			columnCount = headers[0].reduce(
				(sum, header) => sum + (header.colSpan ?? 1),
				0
			);
		let chart: React.ReactNode | undefined,
			body: React.ReactNode,
			footer: React.ReactNode | undefined;
		if (this.state.data?.value) {
			if (this.props.onRenderChart) {
				chart = this.props.onRenderChart(this.state.data.value);
			}
			body = this.props.onRenderBody(this.state.data.value, columnCount);
			if (this.props.onRenderFooter) {
				footer = this.props.onRenderFooter(this.state.data.value, columnCount);
			}
		}
		if (!body) {
			body = (
				<tbody>
					<tr>
						<td colSpan={columnCount}>
							{this.state.data
								? this.state.data.isLoading
									? 'Loading...'
									: this.state.data.errors
									? 'Error loading data.'
									: 'No data found.'
								: 'Click "Run Report" to load data.'}
						</td>
					</tr>
				</tbody>
			);
		}
		return (
			<div className="report-table_gitemz">
				<table>
					<caption>
						<div className="content">
							<div className="header">
								<label>{this.props.title}</label>
								<form>
									{isDateRangeQueryProps(this.props) ? (
										<>
											<InputControl
												type="text"
												label="Start Date"
												value={this.state.startDate}
												onChange={this._setStartDate}
											/>
											<InputControl
												type="text"
												label="End Date"
												value={this.state.endDate}
												onChange={this._setEndDate}
											/>
										</>
									) : null}
									<Button onClick={this._runReport} text="Run Report" />
								</form>
							</div>
							{chart ? <div className="chart">{chart}</div> : null}
						</div>
					</caption>
					<thead>
						{headers.map((row) => (
							<tr key={row.map((header) => header.name).join(',')}>
								{row.map((header, index) => (
									<th
										colSpan={header.colSpan ?? 1}
										key={`${header.name}-${index}`}
									>
										{header.name}
									</th>
								))}
							</tr>
						))}
					</thead>
					{body}
					{footer}
				</table>
			</div>
		);
	}
}
