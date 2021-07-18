import * as React from 'react';
import { AuthorEarningsReport, AuthorEarningsReportStatus, AuthorsEarningsReportResponse } from '../../../../../common/models/subscriptions/AuthorEarningsReport';
import Fetchable from '../../../../../common/Fetchable';
import LoadingOverlay from '../../controls/LoadingOverlay';
import Link from '../../../../../common/components/Link';
import Icon from '../../../../../common/components/Icon';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import { formatCurrency } from '../../../../../common/format';
import InfoBox from '../../../../../common/components/InfoBox';
import { NavReference } from '../../Root';
// import * as classNames from 'classnames';
import ContentBox from '../../../../../common/components/ContentBox';
import { calculateEstimatedReadTime } from '../../../../../common/calculate';
import { EarningsStatusExplainerDialog } from '../../EarningsStatusExplainerDialog';

interface Props {
	onNavTo: (ref: NavReference) => void,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onCloseDialog: () => void,
	response: Fetchable<AuthorsEarningsReportResponse>
}
export default class AuthorLeaderboards extends React.Component<Props> {
	private openStatusExplainerDialog():void {
		this.props.onOpenDialog(
		<EarningsStatusExplainerDialog
			onClose={this.props.onCloseDialog}
		/>)
	}
	private renderStatus(item: AuthorEarningsReport): React.ReactElement {
		switch (item.status) {
			case AuthorEarningsReportStatus.ApproachingMinimum:
				return <Icon
							name="piggy-bank"
							onClick={this.openStatusExplainerDialog.bind(this)}
							title={`Approaching payout minimum`}
						/>;
			case AuthorEarningsReportStatus.NotYetContacted:
				return <Icon
							name="hourglass"
							onClick={this.openStatusExplainerDialog.bind(this)}
							title={`Not yet contacted by Readup`}
					/>;
			case AuthorEarningsReportStatus.Contacted:
				return <Icon
							name="envelope"
							onClick={this.openStatusExplainerDialog.bind(this)}
							title={`Contacted by Readup`}
				/>;
			case AuthorEarningsReportStatus.AuthorPaidOut:
				return <Icon
							name="money-pouch"
							onClick={this.openStatusExplainerDialog.bind(this)}
							title={`Paid out (cash)`}
						/>;
			case AuthorEarningsReportStatus.DonationPaidOut :
				return <Icon
							onClick={this.openStatusExplainerDialog.bind(this)}
							name="charity"
							title={`Donated to ${item.donationRecipientName}.`}
						/>
			default:
				return <>Approaching minimum</>;
		}
	}

	private renderDesktopTable() {
		type ColumnName = 'writer' | 'minutesRead' | 'topArticle'| 'amountEarned' | 'status';
		const columns: { [key in ColumnName]: { class: string, header: string } } = {
			writer: {
				class: 'writer',
				header: 'Writer'
			},
			minutesRead: {
				class: 'minutes-read',
				header: 'Minutes Read'
			},
			topArticle: {
				class: 'top-article',
				header: 'Top Article',
			},
			amountEarned: {
				class: 'amount-earned',
				header: 'Amount Earned'
			},
			status: {
				class: 'status',
				header: 'Status',
			}
		};
		return (<table>
			<thead>
				<tr>
					{Object
						.keys(columns)
						.map(
							key => {
								const column = columns[key as ColumnName];
								return (
									<th
										className={column.class}
										key={key}
									>
									{column.header}
										{ column.class === 'status' && <Icon name="question-circle" onClick={this.openStatusExplainerDialog.bind(this)} />}
									</th>
								);
							}
						)}
				</tr>
			</thead>
			<tbody>
				{this.props.response.value.lineItems.length ?
					this.props.response.value.lineItems
						.sort(
							(a, b) => b.amountEarned - a.amountEarned
						)
						.map(
							item => (
								<tr key={item.authorName}>
									<td
										className={columns.writer.class}
										data-header={columns.writer.header}
									>
										{item.userAccountName ?
											<>
												<Link
													screen={ScreenKey.Profile}
													onClick={this.props.onNavTo}
													params={{ userName: item.userAccountName }}
													text={item.authorName}
												/>
												<Icon name="verified-user" title="Verified" />
											</> :
											<Link
												screen={ScreenKey.Author}
												onClick={this.props.onNavTo}
												params={{ slug: item.authorSlug }}
												text={item.authorName}
											/>}
									</td>
									<td
										className={columns.minutesRead.class}
										data-header={columns.minutesRead.header}
									>
										{item.minutesRead} min.
									</td>
									<td
										className={columns.topArticle.class}
										data-header={columns.topArticle.header}>
											<Link
												screen={ScreenKey.Comments}
												onClick={this.props.onNavTo}
												params={{slug: item.topArticle.slug}}
												text={item.topArticle.title}
												/><br/>
											<span className="details"><span className="source" title={item.topArticle.source}>{item.topArticle.source}</span><i className="spacer"></i>{calculateEstimatedReadTime(item.topArticle.wordCount)} min.<i className="spacer"></i>{item.topArticle.readCount} reads</span>

										{/* {item.topArticle.title} */}
									</td>
									<td
										className={columns.amountEarned.class}
										data-header={columns.amountEarned.header}
									>
										<span className="content">
											{formatCurrency(item.amountEarned)}

										</span>
									</td>
									<td
										className={columns.status.class}
										data-header={columns.status.header}>
										{this.renderStatus(item)}
									</td>
								</tr>
							)
						) :
					<tr>
						<td colSpan={4}>
							No earnings found.
						</td>
					</tr>}
			</tbody>
		</table>)
	}

	public render() {

		return (
			<ContentBox>
				<div className="author-leaderboards_4rtwc1">
					{this.props.response.isLoading ?
						<LoadingOverlay position="static" /> :
						this.props.response.value ?
							this.renderDesktopTable()
							 :
							<InfoBox
								position="static"
								style="normal"
							>
								Error loading report.
							</InfoBox>}
				</div>
			</ContentBox>
		);
	}
}