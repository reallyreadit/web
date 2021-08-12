import * as React from 'react';
import UserArticle from '../models/UserArticle';
import Fetchable from '../Fetchable';
import SpinnerIcon from './SpinnerIcon';
import * as classNames from 'classnames';
import Icon from './Icon';
import ArticleIssueReportRequest from '../models/analytics/ArticleIssueReportRequest';
import ReportWidget from './ReaderHeader/ReportWidget';
import SettingsWidget from './ReaderHeader/SettingsWidget';
import DisplayPreference from '../models/userAccounts/DisplayPreference';
import ShareControl, {MenuPosition} from './ShareControl';
import {DeviceType} from '../DeviceType';
import getShareData from '../sharing/getShareData';
import {ShareEvent} from '../sharing/ShareEvent';
import ShareResponse from '../sharing/ShareResponse';

export interface Props {
	article: Fetchable<UserArticle>,
	deviceType: DeviceType,
	displayPreference: DisplayPreference | null,
	isHidden: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavBack?: () => void,
	onChangeDisplayPreference: (preference: DisplayPreference) => Promise<DisplayPreference>,
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	showProgressBar?: boolean
}
export default class ReaderHeader extends React.Component<Props> {
	public static defaultProps: Partial<Props> = {
		showProgressBar: true
	};
	private readonly _getShareData = (article: UserArticle) => {
		return getShareData(
			'Article',
			article,
			this.props.onCreateAbsoluteUrl
		);
	};

	public render() {
		return (
			<div className="reader-header_h3o6tn">
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
				{(!this.props.article.isLoading && this.props.article.value != null) ?
					<>
						<ShareControl
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onGetData={() => this._getShareData(this.props.article.value)}
							onShare={this.props.onShare}
							menuPosition={MenuPosition.LeftTop}
						>
							<Icon
								display="block"
								name={ this.props.deviceType === DeviceType.Ios ? "share" : "share-android" }
							/>
						</ShareControl>
						<div className="spacer"></div>
					</> :
					// article is loading or not loaded -> don't display share icon
					null
					}
				<SettingsWidget
					displayPreference={this.props.displayPreference}
					isHidden={this.props.isHidden}
					onChangeDisplayPreference={this.props.onChangeDisplayPreference}
				/>
				<div className="spacer"></div>
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