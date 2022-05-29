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
import * as classNames from 'classnames';
import Popover, { MenuPosition, MenuState } from '../Popover';
import Button from '../Button';
import Icon from '../Icon';
import Fetchable from '../../Fetchable';
import UserArticle from '../../models/UserArticle';
import ArticleIssueReportRequest from '../../models/analytics/ArticleIssueReportRequest';

interface Props {
	article: Fetchable<Pick<UserArticle, 'id'>>,
	isHidden: boolean,
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void
}
interface State {
	menuState: MenuState
}
export default class ReportWidget extends React.PureComponent<Props, State> {
	private readonly _beginClosingMenu = () => {
		this.setState({
			menuState: MenuState.Closing
		});
	};
	private readonly _closeMenu = () => {
		this.setState({
			menuState: MenuState.Closed
		});
	};
	private readonly _openMenu = () => {
		if (!this.props.article.value) {
			return;
		}
		this.setState({
			menuState: MenuState.Opened
		});
	};
	private readonly _reportAdsClutter = () => {
		this.props.onReportArticleIssue({
			articleId: this.props.article.value.id,
			issue: 'Ads/Clutter'
		});
		this._beginClosingMenu();
	};
	private readonly _reportMissingWords = () => {
		this.props.onReportArticleIssue({
			articleId: this.props.article.value.id,
			issue: 'Missing Words'
		});
		this._beginClosingMenu();
	};
	private readonly _reportMissingImages = () => {
		this.props.onReportArticleIssue({
			articleId: this.props.article.value.id,
			issue: 'Missing Images'
		});
		this._beginClosingMenu();
	};
	private readonly _reportPaywall = () => {
		this.props.onReportArticleIssue({
			articleId: this.props.article.value.id,
			issue: 'Hit a Paywall'
		});
		this._beginClosingMenu();
	};
	private readonly _reportCouldntFinish = () => {
		this.props.onReportArticleIssue({
			articleId: this.props.article.value.id,
			issue: 'Couldn\'t get to 100%'
		});
		this._beginClosingMenu();
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			menuState: MenuState.Closed
		};
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.isHidden &&
			!prevProps.isHidden &&
			this.state.menuState === MenuState.Opened
		) {
			this._beginClosingMenu();
		}
	}
	public render() {
		return (
			<div className="report-widget_psgwlm widget">
				<Popover
					menuChildren={
						<div className="widget-menu-content">
							<label>Report a readability issue</label>
							<Button
								align="center"
								display="block"
								onClick={this._reportAdsClutter}
								text="Ads/Clutter"
							/>
							<Button
								align="center"
								display="block"
								onClick={this._reportMissingWords}
								text="Missing Words"
							/>
							<Button
								align="center"
								display="block"
								onClick={this._reportMissingImages}
								text="Missing Images"
							/>
							<Button
								align="center"
								display="block"
								onClick={this._reportPaywall}
								text="Hit a Paywall"
							/>
							<Button
								align="center"
								display="block"
								onClick={this._reportCouldntFinish}
								text="Couldn't get to 100%"
							/>
						</div>
					}
					menuPosition={MenuPosition.BottomRight}
					menuState={this.state.menuState}
					onBeginClosing={this._beginClosingMenu}
					onClose={this._closeMenu}
					onOpen={this._openMenu}
				>
					<Icon
						badge={false}
						display="block"
						className={classNames({ 'disabled': !this.props.article.value })}
						name="flag"
					/>
				</Popover>
			</div>
		);
	}
}