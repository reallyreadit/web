import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import DateRangeQuery from '../../../../common/models/analytics/DateRangeQuery';
import { RevenueReportResponse, RevenueReportLineItem } from '../../../../common/models/analytics/RevenueReport';
import { DateTime } from 'luxon';
import { formatCurrency } from '../../../../common/format';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import * as classNames from 'classnames';
import { ResponsiveContainer, Area, XAxis, YAxis, Tooltip, ComposedChart, Line } from 'recharts';
import { ChartKey } from '../controls/ChartKey';
import { ReportTable } from './ReportTable';

interface Props {
	onGetRevenueReport: FetchFunctionWithParams<DateRangeQuery, RevenueReportResponse>
}
interface LineItemPeriodGroup {
	period: string,
	items: RevenueReportLineItem[]
}

enum Price {
	Budget = 'Budget',
	Reader = 'Reader',
	SuperReader = 'Super Reader'
}

function getHeaders() {
	return [
		[
			{
				name: ''
			},
			{
				name: 'Budget ($4.99)',
				colSpan: 2
			},
			{
				name: 'Reader ($14.99)',
				colSpan: 2
			},
			{
				name: 'Super Reader ($24.99)',
				colSpan: 2
			},
			{
				name: 'Custom'
			},
			{
				name: ''
			},
			{
				name: ''
			}
		],
		[
			{
				name: 'Period'
			},
			{
				name: 'Apple'
			},
			{
				name: 'Stripe'
			},
			{
				name: 'Apple'
			},
			{
				name: 'Stripe'
			},
			{
				name: 'Apple'
			},
			{
				name: 'Stripe'
			},
			{
				name: 'Stripe'
			},
			{
				name: 'Total'
			},
			{
				name: 'MRR'
			}
		]
	];
}
function createPeriodGroups(data: RevenueReportResponse) {
	return data.lineItems
		.reduce<LineItemPeriodGroup[]>(
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
}
function getCustomItems(items: RevenueReportLineItem[]) {
	return items.filter(
		item => item.priceAmount > 0 && !item.priceName
	);
}
function renderBody(data: RevenueReportResponse) {
	if (!data.lineItems.length) {
		return null;
	}
	return (
		<tbody>
			{createPeriodGroups(data)
				.map(
					group => {
						const
							groupTotal = sumNetAmount(group.items),
							customTotal = sumNetAmount(
								getCustomItems(group.items)
							),
							monthlyRecurringLineItem = data.monthlyRecurringRevenueLineItems.find(
								item => item.period === group.period
							);
						return (
							<tr key={group.period}>
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
				)}
		</tbody>
	);
}
function renderChart(data: RevenueReportResponse) {
	if (!data.lineItems.length) {
		return null;
	}
	const chartPoints = createPeriodGroups(data)
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
				monthlyRecurringRevenue: data.monthlyRecurringRevenueLineItems
					.find(
						item => item.period === group.period
					)
					.amount
			})
		);
	return (
		<>
			<ResponsiveContainer aspect={2}>
				<ComposedChart
					data={chartPoints}
					margin={{ top: 10, right: 20, left: 10 }}
					onClick={
						() => {
							// need to have an onClick handler in order for touch events to display tooltips
						}
					}
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
		</>
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
function renderFooter(data: RevenueReportResponse) {
	if (!data.lineItems.length) {
		return null;
	}
	const
		customTotal = sumNetAmount(
			getCustomItems(data.lineItems)
		),
		grandTotal = sumNetAmount(data.lineItems);
	return (
		<tfoot>
			<tr>
				<th>Total</th>
				{renderProviderPriceCells(data.lineItems, Price.Budget, 'total')}
				{renderProviderPriceCells(data.lineItems, Price.Reader, 'total')}
				{renderProviderPriceCells(data.lineItems, Price.SuperReader, 'total')}
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

export class RevenueReport extends React.Component<Props> {
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
				days: 30
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
				title="Revenue Report"
				initialStartDate={this._initialStartDate}
				initialEndDate={this._initialEndDate}
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetRevenueReport}
				onRenderBody={renderBody}
				onRenderChart={renderChart}
				onRenderFooter={renderFooter}
			/>
		);
	}
}