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

type ServerArticle = Pick<UserArticle, 'aotdContenderRank' | 'aotdTimestamp' | 'commentCount' | 'dateStarred' | 'firstPoster' | 'hotScore' | 'slug'>;
export interface Props {
	article: Fetchable<ServerArticle>,
	authors: string[],
	onCreateAbsoluteUrl: (path: string) => string,
	onSetStarred: (isStarred: boolean) => Promise<void>,
	onToggleDebugMode: () => void,
	onViewComments: (article: Pick<UserArticle, 'slug'>) => void,
	onViewProfile: (userName: string) => void,
	title: string,
	wordCount: number
}
interface State {
	isStarring: boolean
}
export default class BroserHeader extends React.PureComponent<Props, State> {
	private _debugSequence: number[] = [];
	private readonly _handleDebugClickLeft = () => {
		const now = Date.now();
		if (
			this._debugSequence.length === 2 &&
			now - this._debugSequence[1] <= 500
		) {
			// continue sequence
			this._debugSequence.push(now);
		} else {
			// start sequence
			this._debugSequence = [now];
		}
	};
	private readonly _handleDebugClickRight = () => {
		const now = Date.now();
		if (
			this._debugSequence.length % 2 === 1 &&
			now - this._debugSequence[this._debugSequence.length - 1] <= 500
		) {
			if (this._debugSequence.length === 1) {
				// continue sequence
				this._debugSequence.push(now);
			} else {
				// end sequence
				this._debugSequence = [];
				this.props.onToggleDebugMode();
			}
		}
	};
	private readonly _toggleStar = () => {
		if (!this.props.article.value || this.state.isStarring) {
			return;
		}
		this.setState({
			isStarring: true
		});
		this.props
			.onSetStarred(!this.props.article.value.dateStarred)
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
			article: Pick<UserArticle, 'aotdContenderRank' | 'aotdTimestamp' | 'commentCount' | 'dateStarred' | 'firstPoster' | 'hotScore'>,
			commentsLinkHref: string;
		if (this.props.article.isLoading) {
			article = {
				aotdContenderRank: 0,
				aotdTimestamp: null,
				commentCount: 0,
				dateStarred: null,
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
						busy={this.state.isStarring}
						className={classNames('star', { 'loaded': !this.props.article.isLoading })}
						onClick={this._toggleStar}
						starred={!!this.props.article.value?.dateStarred}
					/>
					{this.props.title}
				</div>
				{this.props.authors.length ?
					<div className="byline">{formatList(this.props.authors)}</div> :
					null}
				<div className="length">
					<span className="value">
						{calculateEstimatedReadTime(this.props.wordCount)} min read.
						<div
							className="debug-left"
							onClick={this._handleDebugClickLeft}
						></div>
						<div
							className="debug-right"
							onClick={this._handleDebugClickRight}
						></div>	
					</span>
				</div>
			</div>
		);
	}
}