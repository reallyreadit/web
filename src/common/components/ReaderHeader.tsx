// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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
import ShareControl, { MenuPosition } from './ShareControl';
import { DeviceType } from '../DeviceType';
import getShareData from '../sharing/getShareData';
import { ShareEvent } from '../sharing/ShareEvent';
import ShareResponse from '../sharing/ShareResponse';
import { ShareChannelData } from '../sharing/ShareData';
import Star from './Star';
import UserAccount from '../models/UserAccount';

export interface Props {
	article: Fetchable<UserArticle>;
	deviceType: DeviceType;
	displayPreference: DisplayPreference | null;
	isHidden: boolean;
	onCreateAbsoluteUrl: (path: string) => string;
	onNavBack?: () => void;
	onChangeDisplayPreference: (
		preference: DisplayPreference
	) => Promise<DisplayPreference>;
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void;
	onShare: (data: ShareEvent) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onToggleStar: () => Promise<void>;
	showProgressBar?: boolean;
	user: UserAccount | null
}
export default class ReaderHeader extends React.Component<
	Props,
	{ isStarring: boolean }
> {
	public static defaultProps: Pick<Props, 'showProgressBar'> = {
		showProgressBar: true,
	};
	private readonly _getShareData = (article: UserArticle) => {
		return getShareData('Article', article);
	};
	private readonly _toggleStar = () => {
		this.setState({ isStarring: true });
		this.props
			.onToggleStar()
			.then(() => {
				this.setState({ isStarring: false });
			})
			.catch(() => {
				this.setState({ isStarring: false });
			});
	};

	constructor(props: Props) {
		super(props);
		this.state = { isStarring: false };
	}

	public render() {
		return (
			<div className="reader-header_h3o6tn">
				<div className="widget back">
					{this.props.onNavBack ? (
						<Icon
							badge={false}
							display="block"
							name="chevron-left"
							onClick={this.props.onNavBack}
						/>
					) : null}
				</div>
				<div className="separator"></div>
				{!this.props.article.isLoading && this.props.article.value != null ? (
					<>
						<div className="widget">
							<Star
								starred={!!this.props.article.value.dateStarred}
								busy={this.state.isStarring}
								look='action'
								onClick={this._toggleStar}
							/>
						</div>
						<div className="spacer"></div>
						<div className="widget">
							<ShareControl
								onGetData={() => this._getShareData(this.props.article.value)}
								onShare={this.props.onShare}
								onShareViaChannel={this.props.onShareViaChannel}
								menuPosition={MenuPosition.LeftTop}
							>
								<Icon
									display="block"
									name={
										this.props.deviceType === DeviceType.Ios
											? 'share'
											: 'share-android'
									}
								/>
							</ShareControl>
						</div>
						<div className="spacer"></div>
					</>
				) : // article is loading or not loaded -> don't display star or share icon
				null}
				<SettingsWidget
					displayPreference={this.props.displayPreference}
					isHidden={this.props.isHidden}
					onChangeDisplayPreference={this.props.onChangeDisplayPreference}
				/>
				{this.props.user ?
					<>
						<div className="spacer"></div>
						<ReportWidget
							article={this.props.article}
							isHidden={this.props.isHidden}
							onReportArticleIssue={this.props.onReportArticleIssue}
						/>
					</> :
					null}
				{this.props.showProgressBar && this.props.user ? (
					<>
						<div className="spacer"></div>
						<div className="widget progress">
							<div className="progress-bar">
								{this.props.article.isLoading ? (
									<SpinnerIcon />
								) : this.props.article.value ? (
									<>
										<div
											className={classNames('fill', {
												complete: this.props.article.value.isRead,
											})}
											style={{
												transform: `translateY(${
													100 - this.props.article.value.percentComplete
												}%)`,
											}}
										></div>
										<span className="text">
											{Math.floor(this.props.article.value.percentComplete) +
												'%'}
										</span>
									</>
								) : null}
							</div>
						</div>
					</>
				) : null}
			</div>
		);
	}
}
