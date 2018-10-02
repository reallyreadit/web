import * as React from 'react';
import UserArticle from '../models/UserArticle';
import ArticleDetailsTitle from './ArticleDetails/ArticleDetailsTitle';
import readingParameters from '../readingParameters';
import SpeechBubble from './Logo/SpeechBubble';
import classNames from 'classnames';
import CommentsActionLink from './CommentsActionLink';
import Icon from './Icon';
import { formatTimestamp } from '../format';
import ReadCountIndicator from './ReadCountIndicator';

interface Props {
	article: UserArticle,
	isUserSignedIn: boolean,
	onDelete?: (article: UserArticle) => void,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (article: UserArticle) => void,
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	showDeleteControl?: boolean
}
export default class extends React.PureComponent<Props, { isStarring: boolean }> {
	public static defaultProps = {
		onDelete: () => {},
		showDeleteControl: false
	};
	private readonly _delete = () => {
		this.props.onDelete(this.props.article);
	};
	private readonly _read = (e: React.MouseEvent<HTMLAnchorElement>) => {
		this.props.onRead(this.props.article, e);
	};
	private readonly _share = () => {
		if (this.props.article.isRead) {
			this.props.onShare(this.props.article);
		}
	};
	private readonly _toggleStar = () => {
		this.setState({ isStarring: true });
		this.props
			.onToggleStar(this.props.article)
			.then(() => { this.setState({ isStarring: false }); })
			.catch(() => { this.setState({ isStarring: false }); })
	};
	private readonly _viewComments = (e: React.MouseEvent<HTMLElement>) => {
		this.props.onViewComments(this.props.article, e as React.MouseEvent<HTMLAnchorElement>);
	};
	constructor(props: Props) {
		super(props);
		this.state = { isStarring: false };
	}
	public render() {
		return (
			<div className="article-details">
				<div className="content">
					<ArticleDetailsTitle
						article={this.props.article}
						isStarring={this.state.isStarring}
						onClick={this._read}
						onToggleStar={this._toggleStar}
						showStar={this.props.isUserSignedIn}
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
							<ArticleDetailsTitle
								article={this.props.article}
								isStarring={this.state.isStarring}
								onClick={this._read}
								onToggleStar={this._toggleStar}
								showStar={this.props.isUserSignedIn}
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
										article={this.props.article}
										onClick={this._viewComments}
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
								className={classNames('share', { enabled: this.props.article.isRead })}
								onClick={this._share}
							/>
						</div>
					</div>
				</div>
				<div className={classNames('controls', { hidden: !this.props.showDeleteControl })}>
					<div className="delete-control" title="Delete Article">
						<Icon name="cancel" onClick={this._delete} />
					</div>
				</div>
			</div>
		);
	}
}