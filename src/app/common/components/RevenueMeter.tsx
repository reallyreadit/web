import * as React from 'react';
import { RevenueReportResponse } from '../../../common/models/subscriptions/RevenueReport';
import Fetchable from '../../../common/Fetchable';
import { formatCurrency } from '../../../common/format';
import Icon from '../../../common/components/Icon';

interface Props {
	onOpenEarningsExplainerDialog: () => void,
	report: Fetchable<RevenueReportResponse>
}

export const RevenueMeter: React.SFC<Props> = (props: Props) => (
	<div className="revenue-meter_56f8z4">
		{props.report.value?.report.totalRevenue > 0 ?
			<>
				<div className="writer-allocation">Readup has earned {formatCurrency(props.report.value.report.authorAllocation)} for writers. <Icon name="question-circle" onClick={props.onOpenEarningsExplainerDialog} /></div>
				<div className="meter">
					<div
						className="fill"
						style={{
							width: ((props.report.value.report.authorAllocation / props.report.value.report.totalRevenue) * 100) + '%'
						}}
					></div>
				</div>
				<div className="total-revenue">Total Revenue: {formatCurrency(props.report.value.report.totalRevenue)}</div>
			</> :
			null}
	</div>
)