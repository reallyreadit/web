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
import UserArticle from '../../../../../common/models/UserArticle';
import Button from '../../../../../common/components/Button';

interface Props {
	onNavTo: (ref: NavReference) => void,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onCloseDialog: () => void,
	onLoadMoreAuthors: () => void,
	response: Fetchable<AuthorsEarningsReportResponse>
	responseMore: Fetchable<AuthorsEarningsReportResponse>
}

type ColumnName = 'writer' | 'minutesRead' | 'topArticle'| 'amountEarned' | 'status';

type ColumnDefinition = { [key in ColumnName]: { class: string, header: string } }
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

	private renderMobileCard(item: AuthorEarningsReport) {
		const [sourceSlug, articleSlug] = item.topArticle.slug.split('_'),
		articleUrlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		}

		return (<ContentBox key={item.authorSlug}>
			<div className="author-section">
				<div className="top-line">{this.renderAuthorLink(item)}<span className="earnings">Earned {formatCurrency(item.amountEarned)} {this.renderStatus(item)}</span></div>
				<span className="minutes-read">Read for {item.minutesRead} min.</span>
			</div>
			<div className="article-section">
				<Link
					screen={ScreenKey.Comments}
					onClick={this.props.onNavTo}
					params={articleUrlParams}
					>
					<div className="top-article">Top Article <Icon name="arrow-ne" title="Open link to comments"/></div>
					<div>{item.topArticle.title}</div>
					<div>{this.renderDetailsLine(item.topArticle)}</div>
				</Link>
			</div>
			</ContentBox>
		);
	}



	private renderMobileCards(): React.ReactNode {
		return <>
			{this.props.response.value.lineItems.length ?
				this.props.response.value.lineItems
				.sort(
					(a, b) => b.amountEarned - a.amountEarned
				)
				.map(this.renderMobileCard.bind(this)) : 'No earnings found'
			}
			{this.props.responseMore
					&& !this.props.responseMore.isLoading
					&& this.props.responseMore.value.lineItems.length ?
						this.props.responseMore.value.lineItems
						.sort(
							(a, b) => b.amountEarned - a.amountEarned
						)
						.map(this.renderMobileCard.bind(this))
					: this.props.responseMore
						&& !this.props.responseMore.isLoading
						&& this.props.responseMore.value.lineItems.length === 0 ?
							'No more earnings found.'
					: null
			}
			<div className="load-more-button-mobile-container">
				{this.renderLoadMoreButton()}
			</div>
			</>
	}

	private renderDetailsLine(topArticle: UserArticle) : React.ReactNode {
		return <span className="details"><span className="source" title={topArticle.source}>{topArticle.source}</span><i className="spacer"></i>{calculateEstimatedReadTime(topArticle.wordCount)} min.<i className="spacer"></i>{topArticle.readCount} reads</span>
	}

	private renderAuthorLink(item: AuthorEarningsReport): React.ReactNode {
		return item.userAccountName ?
			<span>
				<Link
					screen={ScreenKey.Profile}
					onClick={this.props.onNavTo}
					params={{ userName: item.userAccountName }}
					text={item.authorName}
				/>
				<Icon name="verified-user" title="Verified" />
			</span> :
			<Link
				screen={ScreenKey.Author}
				onClick={this.props.onNavTo}
				params={{ slug: item.authorSlug }}
				text={item.authorName}
			/>
	}

	private renderLoadMoreButton(): React.ReactNode {
		return !this.props.response.isLoading && this.props.response.value.lineItems.length ? <div className="load-more-button"><Icon name="arrow-down"/><Button text="Load more" size="normal" intent="normal" onClick={this.props.onLoadMoreAuthors}
			state={
				(!!this.props.responseMore && !this.props.responseMore.isLoading) ? 'disabled' :
				(!!this.props.responseMore && this.props.responseMore.isLoading) ? 'busy' : 'normal'} /></div>
		: null
	}

	private renderDesktopLineItem(columns: ColumnDefinition, item: AuthorEarningsReport): React.ReactNode {
			const [sourceSlug, articleSlug] = item.topArticle.slug.split('_'),
				articleUrlParams = {
					['articleSlug']: articleSlug,
					['sourceSlug']: sourceSlug
				};
			return (
			<tr key={item.authorSlug}>
				<td
					className={columns.writer.class}
					data-header={columns.writer.header}
				>
					{this.renderAuthorLink(item)}
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
							params={articleUrlParams}
							text={item.topArticle.title}
							/><br/>
						{this.renderDetailsLine(item.topArticle)}

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
	}

	private renderDesktopTable() {
		const columns: ColumnDefinition = {
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
		return (<><table>
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
							(item) => this.renderDesktopLineItem(columns, item)
						) :
					<tr>
						<td colSpan={4}>
							No earnings found.
						</td>
					</tr>
					}

					{this.props.responseMore
						&& !this.props.responseMore.isLoading
						&& this.props.responseMore.value.lineItems.length ?
					this.props.responseMore.value.lineItems
						.sort(
							(a, b) => b.amountEarned - a.amountEarned
						)
						.map(
							(item) => this.renderDesktopLineItem(columns, item)
						) : this.props.responseMore
						&& !this.props.responseMore.isLoading
						&& this.props.responseMore.value.lineItems.length === 0 ?
						<tr>
							<td colSpan={4}>
								No more earnings found.
							</td>
						</tr>
						: null
					}
			</tbody>
		</table>
		{this.renderLoadMoreButton()}
		</>
		)

	}

	public render() {

		return (
			this.props.response.isLoading ?
				<ContentBox>
					<LoadingOverlay position="static" />
				</ContentBox> :
				this.props.response.value ?
					<div className="author-leaderboards_4rtwc1">
						<div className="mobile-container">
							{this.renderMobileCards()}
						</div>
						<div className="desktop-container">
							<ContentBox>
								{this.renderDesktopTable()}
							</ContentBox>
						</div>
					</div>
						:
					<ContentBox>
						<InfoBox
							position="static"
							style="normal"
						>
							Error loading report.
						</InfoBox>
					</ContentBox>

		);
	}
}