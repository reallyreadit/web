import * as React from 'react';
import UserArticle from '../models/UserArticle';
import Title from './ArticleDetails/Title';
import readingParameters from '../readingParameters';
import SpeechBubble from './Logo/SpeechBubble';
import DoubleRPathGroup from './Logo/DoubleRPathGroup';
import * as className from 'classnames';
import CommentsActionLink from './CommentsActionLink';
import Icon from './Icon';
import { formatTimestamp } from '../format';

interface Props {
	article: UserArticle,
	isUserSignedIn: boolean,
	showDeleteControl?: boolean,
	isStarring: boolean,
	onStar: () => void,
	onTitleClick: (e: React.MouseEvent<HTMLAnchorElement>) => void,
	onCommentsClick: () => void,
	onDelete?: () => void
}
const render: React.SFC<Props> = (props: Props) => (
	<div className="article-details">
		<div className="content">
			<Title
				article={props.article}
				showStar={props.isUserSignedIn}
				isStarring={props.isStarring}
				onStar={props.onStar}
				onClick={props.onTitleClick}
			/>
			{props.article.tags.length ?
				<div className="tags">
						{props.article.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
				</div> :
				null}
			<div className="columns">
				<div className="left">
					<div className="length">
							{Math.round(props.article.wordCount / readingParameters.averageWordsPerMinute)} min
						</div>
					<div className="speech-bubble-container">
						<SpeechBubble
							percentComplete={props.article.percentComplete}
							isRead={props.article.isRead}
							uuid={`article-details-${props.article.id}`}
						>
							{!props.isUserSignedIn ?
								<DoubleRPathGroup /> :
								null}
						</SpeechBubble>
						{props.isUserSignedIn ?
							<div className="percent-complete-label">{props.article.percentComplete.toFixed() + '%'}</div> :
							null}
					</div>
				</div>
				<div className="middle">
					<Title
						article={props.article}
						showStar={props.isUserSignedIn}
						isStarring={props.isStarring}
						onStar={props.onStar}
						onClick={props.onTitleClick}
					/>
					{props.article.description ?
						<div className="description">{props.article.description}</div> :
						null}
					<div className="s-r-c">
						<div className="source">
							{
								props.article.source +
								(props.article.section ? ' >> ' + props.article.section : '') +
								(props.article.authors.length ? ' - ' + props.article.authors.join(', ') : '')
							}
						</div>
						<span className="reads">
							<Icon name="book" />
							{props.article.readCount + ' ' + (props.article.readCount === 1 ? 'read' : 'reads')}
						</span>
						<CommentsActionLink
							commentCount={props.article.commentCount}
							onClick={props.onCommentsClick}
						/>
						{props.article.aotdTimestamp ?
							<Icon
								name="trophy"
								title={`Article of the Day on ${formatTimestamp(props.article.aotdTimestamp)}`}
								className="aotd"
							/> :
							null}
					</div>
				</div>
				<div className="right">
					<Icon
						name="share"
						title="Share Article"
						className={className({ enabled: props.article.isRead })}
						onClick={props.onDelete}
					/>
				</div>
			</div>
		</div>
		<div className={className('controls', { hidden: !props.showDeleteControl })}>
			<div className="delete-control" title="Delete Article">
				<Icon name="cancel" onClick={props.onDelete} />
			</div>
		</div>
	</div>
);
render.defaultProps = {
	showDeleteControl: false,
	onDelete: () => {}
};
export default render;