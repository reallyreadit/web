import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import { AuthorsEarningsReportResponse } from '../../../../common/models/subscriptions/AuthorEarningsReport';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunction } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import InfoBox from '../../../../common/components/InfoBox';
import Link from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { NavReference } from '../Root';
import Icon from '../../../../common/components/Icon';
import { formatCurrency } from '../../../../common/format';
import RouteLocation from '../../../../common/routing/RouteLocation';

interface Props {
	onGetAuthorsEarningsReport: FetchFunction<AuthorsEarningsReportResponse>,
	onNavTo: (ref: NavReference) => void,
	onOpenEarningsExplainerDialog: () => void,
	title?: string
}

interface State {
	response: Fetchable<AuthorsEarningsReportResponse>
}

class AuthorsEarningsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			response: props.onGetAuthorsEarningsReport(
				response => {
					this.setState({
						response
					});
				}
			)
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
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
			<ScreenContainer className="authors-earnings-screen_7wh7km">
				{this.state.response.isLoading ?
					<LoadingOverlay position="absolute" /> :
					this.state.response.value ?
						<>
							{this.props.title ?
								<h1>{this.props.title} <Icon name="question-circle" onClick={this.props.onOpenEarningsExplainerDialog} /></h1> :
								null}
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
									{this.state.response.value.lineItems.length ?
										this.state.response.value.lineItems
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
															{formatCurrency(item.amountEarned)}
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
							</table>
						</> :
						<InfoBox
							position="absolute"
							style="normal"
						>
							Error loading report.
						</InfoBox>}
			</ScreenContainer>
		);
	}
}

export function createAuthorsEarningsScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<Props, Exclude<keyof Props, 'title'>>,
	options?: {
		renderTitle?: boolean
	}
) {
	const title = 'Writers\' Earnings';
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title,
			titleContent: !options?.renderTitle ?
				<span className="authors-earnings-screen_7wh7km_header">
					Writers' Earnings <Icon name="question-circle" onClick={services.onOpenEarningsExplainerDialog} />
				</span> :
				null
		}),
		render: () => (
			<AuthorsEarningsScreen
				onGetAuthorsEarningsReport={services.onGetAuthorsEarningsReport}
				onNavTo={services.onNavTo}
				onOpenEarningsExplainerDialog={services.onOpenEarningsExplainerDialog}
				title={options?.renderTitle ? title : null}
			/>
		)
	};
}