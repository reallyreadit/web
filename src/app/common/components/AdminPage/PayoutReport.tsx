import * as React from 'react';
import { PayoutReportRequest, PayoutReportResponse } from '../../../../common/models/subscriptions/PayoutReport';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import { ReportTable } from './ReportTable';
import { formatCurrency } from '../../../../common/format';
import * as classNames from 'classnames';

interface Props {
	onGetPayoutReport: FetchFunctionWithParams<PayoutReportRequest, PayoutReportResponse>
}

function getHeaders() {
	return [
		[
			{
				name: 'Name'
			},
			{
				name: 'Total Earnings'
			},
			{
				name: 'Total Payouts'
			},
			{
				name: 'Total Donations'
			},
			{
				name: 'Current Balance'
			}
		]
	];
}

function renderBody(data: PayoutReportResponse) {
	if (!data.lineItems.length) {
		return null;
	}
	return (
		<tbody>
			{data.lineItems.map(
				item => (
					<tr key={item.authorName}>
						<td>{item.authorName}</td>
						<td className={classNames('align-right', { 'null': item.totalEarnings === 0 })}>{formatCurrency(item.totalEarnings)}</td>
						<td className={classNames('align-right', { 'null': item.totalPayouts === 0 })}>{formatCurrency(item.totalPayouts)}</td>
						<td className={classNames('align-right', { 'null': item.totalDonations === 0 })}>{formatCurrency(item.totalDonations)}</td>
						<td className={classNames('align-right', { 'null': item.currentBalance === 0 })}>
							<strong>{formatCurrency(item.currentBalance)}</strong>
						</td>
					</tr>
				)
			)}
		</tbody>
	);
}

export class PayoutReport extends React.Component<Props> {
	public render() {
		return (
			<ReportTable
				title="Payouts"
				onGetHeaders={getHeaders}
				onFetchData={this.props.onGetPayoutReport}
				onRenderBody={renderBody}
			/>
		);
	}
}