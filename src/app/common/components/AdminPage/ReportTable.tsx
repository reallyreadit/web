import * as React from 'react';
import InputControl from '../../../../common/components/controls/InputControl';
import Button from '../../../../common/components/Button';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import DateRangeQuery from '../../../../common/models/analytics/DateRangeQuery';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';

interface Header {
	name: string,
	colSpan?: number
}
interface Props<TData> {
	title: string,
	initialStartDate: string,
	initialEndDate: string,
	onGetHeaders: (data?: TData) => Header[][],
	onFetchData: FetchFunctionWithParams<DateRangeQuery, TData>,
	onRenderBody: (data: TData, columnCount: number) => React.ReactNode | null,
	onRenderChart?: (data: TData) => React.ReactNode,
	onRenderFooter?: (data: TData, columnCount: number) => React.ReactNode
};
interface State<TData> {
	startDate: string,
	endDate: string,
	data: Fetchable<TData> | null
}
export class ReportTable<TData> extends React.Component<Props<TData>, State<TData>> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _runReport = (event: React.MouseEvent) => {
		event.preventDefault();
		this.setState({
			data: this.props.onFetchData(
				{
					startDate: this.state.startDate,
					endDate: this.state.endDate
				},
				this._asyncTracker.addCallback(
					data => {
						this.setState({
							data
						});
					}
				)
			)
		});
	};
	private readonly _setStartDate = (value: string) => {
		this.setState({
			startDate: value
		});
	};
	private readonly _setEndDate = (value: string) => {
		this.setState({
			endDate: value
		});
	};
	constructor(props: Props<TData>) {
		super(props);
		this.state = {
			data: null,
			startDate: props.initialStartDate,
			endDate: props.initialEndDate
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const
			headers = this.props.onGetHeaders(this.state.data?.value),
			columnCount = headers[0].reduce(
				(sum, header) => sum + (header.colSpan ?? 1),
				0
			);
		let
			chart: React.ReactNode | undefined,
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
							{this.state.data ?
								this.state.data.isLoading ?
									'Loading...' :
										this.state.data.errors ?
											'Error loading data.' :
											'No data found.' :
								'Click "Run Report" to load data.'}
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
									<Button
										onClick={this._runReport}
										text="Run Report"
									/>
								</form>
							</div>
							{chart ?
								<div className="chart">
									{chart}
								</div> :
								null}
						</div>
					</caption>
					<thead>
						{headers.map(
							row => (
								<tr key={row.map(header => header.name).join(',')}>
									{row.map(
										header => (
											<th
												colSpan={header.colSpan ?? 1}
												key={header.name}
											>
												{header.name}
											</th>
										)
									)}
								</tr>
							)
						)}
					</thead>
					{body}
					{footer}
				</table>
			</div>
		);
	}
}