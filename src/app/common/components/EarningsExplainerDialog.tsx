import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import { ReadArticleReference } from './Root';
import Fetchable from '../../../common/Fetchable';
import { RevenueReportResponse } from '../../../common/models/subscriptions/RevenueReport';
import { formatCurrency } from '../../../common/format';
import Link from '../../../common/components/Link';

interface Props {
	onClose: () => void,
	onReadArticle: (ref: ReadArticleReference) => void,
	revenueReport: Fetchable<RevenueReportResponse>
}

const blogPost = {
	slug: 'blogreadupcom_how-readup-pays-writers-when-you-read-their-articles',
	url: 'https://blog.readup.com/2021/06/08/how-readup-pays-writers-when-you-read-their-articles.html'
};

export const EarningsExplainerDialog: React.SFC<Props> = props => (
	<Dialog
		onClose={props.onClose}
		title="Writer Earnings on Readup"
	>
		<div className="earnings-explainer-dialog_fih6cj">
			<p>Readup has a simple business model: Readers pay. Writers get paid. And Readup takes a small cut (5%). For more information, check out <Link href={blogPost.url} onClick={() => { props.onReadArticle(blogPost); }}>this blog post</Link>.</p>
			<p>A writer’s Readup earnings never expire and writers receive payouts automatically after being verified by Readup. We’re working constantly to reach out to writers who have earned money on Readup. Here’s how we’re doing so far:</p>
			{props.revenueReport.value ?
				<>
					<p><label>Total writer earnings:</label> {formatCurrency(props.revenueReport.value.report.authorAllocation)}</p>
					<p><label>Total writer distributions:</label> {formatCurrency(props.revenueReport.value.report.authorEarnings)}</p>
					<p><label>Total payouts:</label> {formatCurrency(props.revenueReport.value.report.totalPayouts)}</p>
				</> :
				<p>Loading revenue report...</p>}
		</div>
	</Dialog>
);