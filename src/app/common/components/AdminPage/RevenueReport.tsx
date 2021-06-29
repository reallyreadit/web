import * as React from 'react';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import DateRangeQuery from '../../../../common/models/analytics/DateRangeQuery';
import { RevenueReportResponse, RevenueReportLineItem } from '../../../../common/models/analytics/RevenueReport';
import Fetchable from '../../../../common/Fetchable';
import { DateTime } from 'luxon';
import InputControl from '../../../../common/components/controls/InputControl';
import Button from '../../../../common/components/Button';
import { formatCurrency } from '../../../../common/format';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import * as classNames from 'classnames';
import { ResponsiveContainer, Area, XAxis, YAxis, Tooltip, ComposedChart, Line } from 'recharts';
import { ChartKey } from '../controls/ChartKey';

interface Props {
	onGetRevenueReport: FetchFunctionWithParams<DateRangeQuery, RevenueReportResponse>
}
interface State {
	startDate: string,
	endDate: string,
	response: Fetchable<RevenueReportResponse> | null
}
interface ChartDataPoint {
	xLabel: string,
	appleAmount: number,
	stripeAmount: number
}

enum Price {
	Budget = 'Budget',
	Reader = 'Reader',
	SuperReader = 'Super Reader'
}

function getCustomItems(items: RevenueReportLineItem[]) {
	return items.filter(
		item => item.priceAmount > 0 && !item.priceName
	);
}
function renderProviderPriceCells(items: RevenueReportLineItem[], price: Price, format: 'normal' | 'total' = 'normal') {
	const
		priceItems = items.filter(
			item => item.priceName === price
		),
		appleAmount = sumNetAmount(
			priceItems.filter(
				item => item.provider === SubscriptionProvider.Apple
			)
		),
		stripeAmount = sumNetAmount(
			priceItems.filter(
				item => item.provider === SubscriptionProvider.Stripe
			)
		);
	return (
		<React.Fragment key={price}>
			<td className={classNames('align-right', { 'null': appleAmount === 0 })}>
				{format === 'total' ?
					<strong>{formatCurrency(appleAmount)}</strong> :
					formatCurrency(appleAmount)}
			</td>
			<td className={classNames('align-right', { 'null': stripeAmount === 0 })}>
				{format === 'total' ?
					<strong>{formatCurrency(stripeAmount)}</strong> :
					formatCurrency(stripeAmount)}
			</td>
		</React.Fragment>
	);
}
function renderFooter(items: RevenueReportLineItem[]) {
	const
		customTotal = sumNetAmount(
			getCustomItems(items)
		),
		grandTotal = sumNetAmount(items);
	return (
		<tfoot>
			<tr>
				<th>Total</th>
				{renderProviderPriceCells(items, Price.Budget, 'total')}
				{renderProviderPriceCells(items, Price.Reader, 'total')}
				{renderProviderPriceCells(items, Price.SuperReader, 'total')}
				<td
					className={classNames('align-right', { 'null': customTotal === 0 })}
				>
					<strong>
						{formatCurrency(customTotal)}
					</strong>
				</td>
				<td className={classNames('align-right', { 'null': grandTotal === 0 })}>
					<strong>
						{formatCurrency(grandTotal)}
					</strong>
				</td>
				<td></td>
			</tr>
		</tfoot>
	);
}
function sumNetAmount(items: RevenueReportLineItem[]) {
	return items.reduce(
		(sum, item) => sum + (item.quantityPurchased * item.priceAmount) - (item.quantityRefunded * item.priceAmount),
		0
	);
}

export class RevenueReport extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _runReport = (event: React.MouseEvent) => {
		event.preventDefault();
		this.setState({
			response: this.props.onGetRevenueReport(
				{
					startDate: this.state.startDate,
					endDate: this.state.endDate
				},
				this._asyncTracker.addCallback(
					response => {
						this.setState({
							response
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
	private readonly _showToolTip = () => {
		// need to have an onClick handler in order for touch events to display tooltips
	};
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
		this.state = {
			startDate: localNowDate
				.minus({
					days: 30
				})
				.toISO({
					suppressMilliseconds: true,
					includeOffset: false
				}),
			endDate: localNowDate.toISO({
					suppressMilliseconds: true,
					includeOffset: false
				}),
			response: null
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const columnCount = 10;
		let
			periodGroups: { period: string, items: RevenueReportLineItem[] }[] | null,
			chartPoints: ChartDataPoint[] | null;
		if (this.state.response?.value?.lineItems.length) {
			periodGroups = this.state.response.value.lineItems
				.reduce<{ period: string, items: RevenueReportLineItem[] }[]>(
					(groups, item) => {
						const group = groups.find(
							group => group.period === item.period
						);
						if (group) {
							group.items.push(item);
						} else {
							groups.push({
								period: item.period,
								items: [item]
							});
						}
						return groups;
					},
					[]
				)
				.sort(
					(a, b) => b.period < a.period ?
						-1 :
						b.period > a.period ?
							1 :
							0
				);
			chartPoints = periodGroups
				.slice()
				.reverse()
				.map(
					group => ({
						xLabel: DateTime
							.fromISO(group.period)
							.toFormat('L/d'),
						appleAmount: sumNetAmount(
							group.items.filter(
								item => item.provider === SubscriptionProvider.Apple
							)
						),
						stripeAmount: sumNetAmount(
							group.items.filter(
								item => item.provider === SubscriptionProvider.Stripe
							)
						),
						monthlyRecurringRevenue: this.state.response.value.monthlyRecurringRevenueLineItems
							.find(
								item => item.period === group.period
							)
							.amount
					})
				);
		}
		return (
			<div className="revenue-report_tbgqil">
				<table>
					<caption>
						<div className="content">
							<div className="header">
								<label>Revenue Report</label>
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
							{chartPoints ?
								<div className="chart">
									<ResponsiveContainer aspect={2}>
										<ComposedChart
											data={chartPoints}
											margin={{ top: 10, right: 20, left: 10 }}
											onClick={this._showToolTip}
										>
											<Area
												dataKey="appleAmount"
												fill="#c3d7ef"
												name="Apple"
												stackId="1"
												stroke="#9bbde4"
												type="monotone"
												yAxisId="dailySalesTotal"
											/>
											<Area
												dataKey="stripeAmount"
												fill="#73a3d9"
												name="Stripe"
												stackId="1"
												stroke="#4b88ce"
												type="monotone"
												yAxisId="dailySalesTotal"
											/>
											<Line
												dataKey="monthlyRecurringRevenue"
												dot={false}
												name="MRR"
												stroke="#ff0000"
												strokeWidth={3}
												type="monotone"
												yAxisId="monthlyRecurringRevenue"
											/>
											<XAxis
												dataKey="xLabel"
												minTickGap={1}
											/>
											<YAxis
												minTickGap={1}
												orientation="left"
												tickFormatter={formatCurrency}
												yAxisId="dailySalesTotal"
											/>
											<YAxis
												minTickGap={1}
												orientation="right"
												tickFormatter={formatCurrency}
												yAxisId="monthlyRecurringRevenue"
											/>
											<Tooltip formatter={formatCurrency} />
										</ComposedChart>
									</ResponsiveContainer>
									<ChartKey
										item1="Apple"
										item2="Stripe"
									/>
								</div> :
								null}
						</div>
					</caption>
					<thead>
						<tr>
							<th></th>
							<th colSpan={2}>Budget ($4.99)</th>
							<th colSpan={2}>Reader ($14.99)</th>
							<th colSpan={2}>Super Reader ($24.99)</th>
							<th>Custom</th>
							<th></th>
							<th></th>
						</tr>
						<tr>
							<th>Period</th>
							<th>Apple</th>
							<th>Stripe</th>
							<th>Apple</th>
							<th>Stripe</th>
							<th>Apple</th>
							<th>Stripe</th>
							<th>Stripe</th>
							<th>Total</th>
							<th>MRR</th>
						</tr>
					</thead>
					<tbody>
						{this.state.response ?
							this.state.response.value ?
								this.state.response.value.lineItems.length ?
									periodGroups.map(
										group => {
											const
												groupTotal = sumNetAmount(group.items),
												customTotal = sumNetAmount(
													getCustomItems(group.items)
												),
												monthlyRecurringLineItem = this.state.response.value.monthlyRecurringRevenueLineItems.find(
													item => item.period === group.period
												);
											return (
												<tr>
													<td className="align-center">{group.period.replace(/T00:00:00$/, '')}</td>
													{renderProviderPriceCells(group.items, Price.Budget)}
													{renderProviderPriceCells(group.items, Price.Reader)}
													{renderProviderPriceCells(group.items, Price.SuperReader)}
													<td className={classNames('align-right', { 'null': customTotal === 0 })}>
														{formatCurrency(customTotal)}
													</td>
													<td className={classNames('align-right', { 'null': groupTotal === 0 })}>
														<strong>
															{formatCurrency(groupTotal)}
														</strong>
													</td>
													<td className="align-right">
														{formatCurrency(monthlyRecurringLineItem.amount)}
													</td>
												</tr>
											);
										}
									) :
									<tr>
										<td colSpan={columnCount}>No line items found.</td>
									</tr> :
								this.state.response.isLoading ?
									<tr>
										<td colSpan={columnCount}>Loading...</td>
									</tr> :
									<tr>
										<td colSpan={columnCount}>Error running report.</td>
									</tr> :
							<tr>
								<td colSpan={columnCount}>Click "Run Report" to run report.</td>
							</tr>}
					</tbody>
					{this.state.response?.value?.lineItems.length ?
						renderFooter(this.state.response.value.lineItems) :
						null}
				</table>
			</div>
		);
	}
}