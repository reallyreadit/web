import * as React from 'react';
import { AuthorsEarningsReportResponse } from '../../../../../common/models/subscriptions/AuthorEarningsReport';
import Fetchable from '../../../../../common/Fetchable';
import LoadingOverlay from '../../controls/LoadingOverlay';
import Link from '../../../../../common/components/Link';
import Icon from '../../../../../common/components/Icon';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import { formatCurrency } from '../../../../../common/format';
import InfoBox from '../../../../../common/components/InfoBox';
import { NavReference } from '../../Root';
import * as classNames from 'classnames';

interface Props {
	onNavTo: (ref: NavReference) => void,
	response: Fetchable<AuthorsEarningsReportResponse>
}
export default class AuthorLeaderboards extends React.Component<Props> {
	public render() {
		type ColumnName = 'writer' | 'minutesRead' | 'amountEarned';
		const columns: { [key in ColumnName]: { class: string, header: string } } = {
			writer: {
				class: 'writer',
				header: 'Writer'
			},
			minutesRead: {
				class: 'minutes-read',
				header: 'Minutes Read'
			},
			amountEarned: {
				class: 'amount-earned',
				header: 'Amount Earned'
			}
		};
		return (
			<div className="author-leaderboards_4rtwc1">
				{this.props.response.isLoading ?
					<LoadingOverlay position="static" /> :
					this.props.response.value ?
						<table>
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
														className={columns.amountEarned.class}
														data-header={columns.amountEarned.header}
													>
														<span className="content">
															{formatCurrency(item.amountEarned)}
															<Icon
																className={classNames({ 'hidden': !item.donationRecipientName })}
																name="charity"
																title={`Donated to ${item.donationRecipientName}.`}
															/>
														</span>
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
						</table> :
						<InfoBox
							position="static"
							style="normal"
						>
							Error loading report.
						</InfoBox>}
			</div>
		);
	}
}