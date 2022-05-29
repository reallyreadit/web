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
import { formatTimestamp, formatCountable, truncateText } from '../format';
import Star from './Star';
// import { MenuPosition } from './ShareControl';
import Icon from './Icon';
// import PostButton from './PostButton';
// import AotdMetadata from './AotdMetadata';
import classnames = require('classnames');
import ArticleDetails, {ArticleDetailsProps} from './ArticleDetails';
import ImageComponent from './Image';
import Pill from './Pill';
import PostButton from './PostButton';
import {MenuPosition} from './Popover';

export type ArticleDetailsDisplayProps = ArticleDetailsProps & {
	topline?: string
}
export default class extends ArticleDetails<ArticleDetailsDisplayProps> {
	public render() {
		return (
			<div
				className={classnames( "article-details-display_ssv8xk", {"has-image": true}, this.props.className )}>
				{/* {this.props.showAotdMetadata ?
					<AotdMetadata
						article={this.props.article}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
						pointsCallout={this.props.pointsCallout}
						rankCallout={this.props.rankCallout}
					/> :
					null} */}
				<div
					className="article-container"
					onClick={this._read}
				>
					<ImageComponent
						src={this.props.article.imageUrl}
						alwaysShowPlaceholder={!this._shouldShowImage()}
					/>
					{/* todo: do something with the highlight prop? see ArticleDetails */}
					<div className="article-details-display_ssv8xk__details">
							{ this.props.topline ? <span className="top-line"><Icon name="trophy"/>{this.props.topline}</span> : null }
							<div className="title">
								{/* Bookmark */}
								{/* {!this.props.article.isRead && this.props.article.percentComplete >= 1 ?
									<div className="bookmark">
										<span className="percent-complete">{Math.floor(this.props.article.percentComplete)}%</span>
										<Icon name="bookmark" />
									</div> :
									null} */}
								<a
									className="title-link"
									href={this.props.article.url}
								>
									{this.props.article.title}
								</a>
							</div>
							<div className="meta">
								{this._renderAuthorLinks()}
								{this._renderAuthorLinks().length ?
									<>{" "}in{" "}</> :
									null}
								<span className="source">{this.props.article.source}</span>
								{this.props.article.datePublished ?
									<>
										{" "}
										<i className="spacer"></i>
										{" "}
										<span>{formatTimestamp(this.props.article.datePublished)}</span>
									</> :
									null}
							</div>
							{
								this.props.showDescription && typeof this.props.article.description === "string" ?
								<div className="description">{truncateText(this.props.article.description, this.MAX_DESCRIPTION_LENGTH)}</div>
								: null
							}
							<div className="bottom-bar">
								<div className="stats">
									<Pill>
										<div className="reads">
											<span>{this.props.article.readCount} {formatCountable(this.props.article.readCount, 'read')}</span>
										</div>
									</Pill>
									<Pill><span>{this._renderEstimatedReadTime()}</span></Pill>
									<Pill>
										<div className="comments">
											<a
												href={this._renderCommentsLinkHref()}
												onClick={this._viewComments}
											>
												{this.props.article.commentCount} {formatCountable(this.props.article.commentCount, 'comment')}
											</a>
										</div>
									</Pill>
									{this._renderRatingControl()}
								</div>
								<div className="actions">
									{this._renderShareControl()}
									{this.props.user ?
										<Star
											starred={!!this.props.article.dateStarred}
											busy={this.state.isStarring}
											onClick={this._toggleStar}
										/> :
										null}
									{/* NOTE: re-included the post button for consistency since it's everywhere on the home screen */}
									{(
										this.props.onPost &&
										(this.props.article.isRead || this.props.article.datesPosted.length)
										) ?
									<div className="post">
										<PostButton
											article={this.props.article}
											menuPosition={MenuPosition.LeftMiddle}
											onPost={this.props.onPost}
											stopPropagation={true}
										/>
									</div> :
									null
									}
								</div>
							</div>
					</div>
				</div>
			</div>
		);
	}
}