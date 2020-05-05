import * as React from 'react';
import UserArticle from '../models/UserArticle';
import Fetchable from '../Fetchable';
import SpinnerIcon from './SpinnerIcon';
import * as classNames from 'classnames';
import Icon from './Icon';
import ArticleIssueReportRequest from '../models/analytics/ArticleIssueReportRequest';
import ReportWidget from './ReaderHeader/ReportWidget';

export interface Props {
	article: Fetchable<UserArticle>,
	isHidden: boolean,
	onNavBack?: () => void,
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void,
	showProgressBar?: boolean
}
export default class ReaderHeader extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		showProgressBar: true
	};
	public render() {
		return (
			<div className={classNames('reader-header_h3o6tn', { 'hidden': this.props.isHidden })}>
				<div className="widget back">
					{this.props.onNavBack ?
						<Icon
							badge={false}
							display="block"
							name="chevron-left"
							onClick={this.props.onNavBack}
						/> :
						null}
				</div>
				<div className="separator"></div>
				<ReportWidget
					article={this.props.article}
					isHidden={this.props.isHidden}
					onReportArticleIssue={this.props.onReportArticleIssue}
				/>
				{this.props.showProgressBar ?
					<>
						<div className="spacer"></div>
						<div className="widget progress">
							<div
								className="progress-bar"
							>
								{this.props.article.isLoading ?
									<SpinnerIcon /> :
									this.props.article.value ?
										<>
											<div
												className={classNames('fill', { 'complete': this.props.article.value.isRead })}
												style={{
													transform: `translateY(${100 - this.props.article.value.percentComplete}%)`
												}}
											>
											</div>
											<span className="text">{Math.floor(this.props.article.value.percentComplete) + '%'}</span>
										</> :
										null}
							</div>
						</div>
					</> :
					null}
			</div>
		);
	}
}