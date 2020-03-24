import * as React from 'react';
import Star from '../../../../common/components/Star';
import { formatList, formatCountable } from '../../../../common/format';
import { calculateEstimatedReadTime } from '../../../../common/calculate';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import classNames = require('classnames');
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import AotdRank from '../../../../common/components/AotdRank';
import AotdScore from '../../../../common/components/AotdScore';

type ServerArticle = Pick<UserArticle, 'aotdContenderRank' | 'aotdTimestamp' | 'commentCount' | 'firstPoster' | 'hotScore' | 'slug'>;
export interface Props {
	article: Fetchable<ServerArticle>,
	authors: string[],
	isStarred: boolean,
	isStarring: boolean,
	onCreateAbsoluteUrl: (path: string) => string,
	onSetStarred: (isStarred: boolean) => Promise<void>,
	onViewComments: (article: Pick<UserArticle, 'slug'>) => void,
	onViewProfile: (userName: string) => void,
	title: string,
	wordCount: number
}
interface State {
	isStarring: boolean
}
export default class BroserHeader extends React.PureComponent<Props, State> {
	private readonly _toggleStar = () => {
		if (this.state.isStarring) {
			return;
		}
		this.setState({
			isStarring: true
		});
		this.props
			.onSetStarred(!this.props.isStarred)
			.then(
				() => {
					this.setState({
						isStarring: false
					});
				}
			);
	};
	private readonly _viewComments = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		this.props.onViewComments(this.props.article.value);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isStarring: false
		};
	}
	public render() {
		let
			article: Pick<UserArticle, 'aotdContenderRank' | 'aotdTimestamp' | 'commentCount' | 'firstPoster' | 'hotScore'>,
			commentsLinkHref: string;
		if (this.props.article.isLoading) {
			article = {
				aotdContenderRank: 0,
				aotdTimestamp: null,
				commentCount: 0,
				firstPoster: null,
				hotScore: 0
			};
			commentsLinkHref = '';
		} else {
			const
				[sourceSlug, articleSlug] = this.props.article.value.slug.split('_'),
				articleUrlParams = {
					['articleSlug']: articleSlug,
					['sourceSlug']: sourceSlug
				};
			article = this.props.article.value;
			commentsLinkHref = this.props.onCreateAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Comments)
					.createUrl(articleUrlParams)
			);
		}
		return (
			<div className="browser-header_pg57qm">
				<div className={classNames('fetchable', { 'loaded': !this.props.article.isLoading })}>
					<AotdRank
						article={article}
					/>
					<AotdScore
						article={article}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
					/>
					<a
						className="comments"
						href={commentsLinkHref}
						onClick={this._viewComments}
					>
						{article.commentCount} {formatCountable(article.commentCount, 'comment')}
					</a>
				</div>
				<div className="title">
					<Star
						busy={this.props.isStarring || this.state.isStarring}
						className="star"
						onClick={this._toggleStar}
						starred={this.props.isStarred}
					/>
					{this.props.title}
				</div>
				{this.props.authors.length ?
					<div className="byline">{formatList(this.props.authors)}</div> :
					null}
				<div className="length">{calculateEstimatedReadTime(this.props.wordCount)} min read.</div>
			</div>
		);
	}
}