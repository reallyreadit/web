import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import ArticleList from './ArticleList';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import PageResult from '../../../../../common/models/PageResult';
import Fetchable from '../../../../../common/Fetchable';
import CommunityReads from '../../../../../common/models/CommunityReads';
import produce from 'immer';
import CommunityReadSort from '../../../../../common/models/CommunityReadSort';
import LoadingOverlay from '../LoadingOverlay';
import classNames from 'classnames';

interface State {
	communityReads: Fetchable<CommunityReads>
}
export function updateCommunityReads(this: React.Component<{}, State>, updatedArticle: UserArticle, isCompletionCommit: boolean) {
	if (
		this.state.communityReads.value &&
		(
			[this.state.communityReads.value.aotd]
				.concat(this.state.communityReads.value.articles.items)
				.some(article => article.id === updatedArticle.id) ||
			(!this.state.communityReads.value.userStats && isCompletionCommit)
		)
	) {
		this.setState(produce<State>(prevState => {
			if (prevState.communityReads.value.aotd.id === updatedArticle.id) {
				prevState.communityReads.value.aotd = updatedArticle;
			}
			prevState.communityReads.value.articles.items.forEach((article, index, articles) => {
				if (article.id === updatedArticle.id) {
					articles.splice(articles.indexOf(article), 1, updatedArticle);
				}
			});
			if (!prevState.communityReads.value.userStats && isCompletionCommit) {
				// ugly hack to dismiss welcome info box
				prevState.communityReads.value.userStats = {
					readCount: 1,
					readCountRank: 0,
					streak: null,
					streakRank: null,
					userCount: 0
				};
			}
		}));
	}
}
export default class extends React.PureComponent<{
	aotd: UserArticle,
	articles: PageResult<UserArticle>,
	isLoadingArticles: boolean,
	isUserSignedIn: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onSortChange: (sort: CommunityReadSort) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	sort: CommunityReadSort
}, {}> {
	private readonly _sortByHot = () => {
		this.props.onSortChange(CommunityReadSort.Hot);
	};
	private readonly _sortByTop = () => {
		this.props.onSortChange(CommunityReadSort.Top);
	};
	public render() {
		return (
			<div className="community-reads-list_g4cy3n">
				<h3>Article of the Day</h3>
				<ArticleDetails
					article={this.props.aotd}
					isUserSignedIn={this.props.isUserSignedIn}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onRead={this.props.onReadArticle}
					onShare={this.props.onShareArticle}
					onToggleStar={this.props.onToggleArticleStar}
					onViewComments={this.props.onViewComments}
				/>
				<div className="sort">
					<button
						className={classNames({ 'selected': this.props.sort === CommunityReadSort.Hot })}
						onClick={this._sortByHot}
					>
						Hot
					</button>
					<div className="break"></div>
					<button
						className={classNames({ 'selected': this.props.sort === CommunityReadSort.Top })}
						onClick={this._sortByTop}
					>
						Top
					</button>
				</div>
				{this.props.isLoadingArticles ?
					<LoadingOverlay position="static" /> :
					<ArticleList>
						{this.props.articles.items.map(article =>
							<li key={article.id}>
								<ArticleDetails
									article={article}
									isUserSignedIn={this.props.isUserSignedIn}
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShareArticle}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this.props.onViewComments}
								/>
							</li>
						)}
					</ArticleList>}
			</div>
		);
	}
}