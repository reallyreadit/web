import * as React from 'react';
import UserArticle from '../models/UserArticle';
import Title from './ArticleDetails/ArticleDetailsTitle';
import readingParameters from '../readingParameters';
import SpeechBubble from './Logo/SpeechBubble';
import * as className from 'classnames';
import CommentsActionLink from './CommentsActionLink';
import Icon from './Icon';
import ShimmerGradient from '../svg/ShimmerGradient';
import { formatTimestamp } from '../format';
import ReadCountIndicator from './ReadCountIndicator';

interface Props {
	article: UserArticle,
	isUserSignedIn: boolean,
	showDeleteControl?: boolean,
	isStarring: boolean,
	onStar: () => void,
	onTitleClick: (e: React.MouseEvent<HTMLAnchorElement>) => void,
	onCommentsClick: () => void,
	onDelete?: () => void,
	onShare: () => void
}
export default class extends React.PureComponent<Props, {}> {
	public static defaultProps = {
		showDeleteControl: false,
		onDelete: () => { }
	};
	private readonly _share = () => {
		if (this.props.article.isRead) {
			this.props.onShare();
		}
	};
	public render() {
		const shareGradientUuid = `article-details-share-${this.props.article.id}`;
		return (
			<div className="article-details">
				<div className="content">
					<Title
						article={this.props.article}
						showStar={this.props.isUserSignedIn}
						isStarring={this.props.isStarring}
						onStar={this.props.onStar}
						onClick={this.props.onTitleClick}
					/>
					{this.props.article.tags.length ?
						<div className="tags">
							{this.props.article.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
						</div> :
						null}
					<div className="columns">
						<div className="left">
							<div className="length">
								{Math.max(1, Math.floor(this.props.article.wordCount / readingParameters.averageWordsPerMinute))} min
							</div>
							<SpeechBubble
								percentComplete={this.props.article.percentComplete}
								renderLabel
								isRead={this.props.article.isRead}
								uuid={`article-details-speech-bubble-${this.props.article.id}`}
							/>
						</div>
						<div className="middle">
							<Title
								article={this.props.article}
								showStar={this.props.isUserSignedIn}
								isStarring={this.props.isStarring}
								onStar={this.props.onStar}
								onClick={this.props.onTitleClick}
							/>
							{this.props.article.description ?
								<div className="description" tabIndex={-1}>{this.props.article.description}</div> :
								null}
							<div className="meta-groups">
								<div className="source">
									{
										this.props.article.source +
										(this.props.article.section ? ' >> ' + this.props.article.section : '') +
										(this.props.article.authors.length ? ' - ' + this.props.article.authors.join(', ') : '')
									}
								</div>
								<div className="flex-spacer"></div>
								<div className="rrit-meta">
									<ReadCountIndicator readCount={this.props.article.readCount} />
									<div className="flex-spacer"></div>
									<CommentsActionLink
										commentCount={this.props.article.commentCount}
										onClick={this.props.onCommentsClick}
									/>
									{this.props.article.aotdTimestamp ?
										<div className="flex-spacer"></div> :
										null}
									{this.props.article.aotdTimestamp ?
										<Icon
											key="aotd"
											name="trophy"
											title={`Article of the Day on ${formatTimestamp(this.props.article.aotdTimestamp)}`}
											className="aotd"
										/> :
										null}
									</div>
							</div>
						</div>
						<div className="right">
							<Icon
								name="share"
								title="Share Article"
								className={className({ enabled: this.props.article.isRead })}
								onClick={this._share}
								defs={<ShimmerGradient uuid={shareGradientUuid} />}
								fill={this.props.article.isRead ? `url(#${shareGradientUuid}-shimmer-gradient)` : null}
							/>
						</div>
					</div>
				</div>
				<div className={className('controls', { hidden: !this.props.showDeleteControl })}>
					<div className="delete-control" title="Delete Article">
						<Icon name="cancel" onClick={this.props.onDelete} />
					</div>
				</div>
			</div>
		);
	}
}