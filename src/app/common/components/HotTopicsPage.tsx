import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../serverApi/Fetchable';
import ArticleList from './controls/articles/ArticleList';
import PageSelector from './controls/PageSelector';
import Icon from '../../../common/components/Icon';
import ArticleDetails from '../../../common/components/ArticleDetails';
import PageResult from '../../../common/models/PageResult';
import UserAccount from '../../../common/models/UserAccount';
import HotTopics from '../../../common/models/HotTopics';
import { Screen } from './Root';

function mapToScreenState(hotTopics: Fetchable<HotTopics>) {
	return {
		articleLists: { ['articles']: { ...hotTopics, value: hotTopics.value ? hotTopics.value.articles : null } },
		articles: { ['aotd']: { ...hotTopics, value: hotTopics.value ? hotTopics.value.aotd : null } }
	};
}
export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onGetHotTopics: (pageNumber: number, callback: (hotTopics: Fetchable<HotTopics>) => void) => Fetchable<HotTopics>,
	onGetUser: () => UserAccount | null,
	onGetScreenState: (key: TScreenKey) => Screen,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onSetScreenState: (key: TScreenKey, state: Partial<Screen>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) {
	const getHotTopics = (pageNumber: number) => deps.onGetHotTopics(
		pageNumber,
		hotTopics => {
			deps.onSetScreenState(key, mapToScreenState(hotTopics));
		}
	);
	const reload = (pageNumber: number) => deps.onSetScreenState(key, mapToScreenState(getHotTopics(pageNumber)));
	return {
		create: () => ({ key, ...mapToScreenState(getHotTopics(1)) }),
		render: () => {
			const state = deps.onGetScreenState(key);
			return (
				<HotTopicsPage
					aotd={state.articles['aotd']}
					articles={state.articleLists['articles']}
					isUserSignedIn={!!deps.onGetUser()}
					onReadArticle={deps.onReadArticle}
					onReload={reload}
					onShareArticle={deps.onShareArticle}
					onToggleArticleStar={deps.onToggleArticleStar}
					onViewComments={deps.onViewComments}
				/>
			);
		}
	};
}
export default class HotTopicsPage extends React.PureComponent<{
	aotd: Fetchable<UserArticle>,
	articles: Fetchable<PageResult<UserArticle>>,
	isUserSignedIn: boolean,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onReload: (pageNumber: number) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}, {}> {
	public render() {
		return (
			<div className="hot-topics-page">
				<div className="hot-topics">
					{this.props.aotd.isLoading ?
						<span>Loading...</span> :
						this.props.aotd.errors ?
							<span>Error loading article of the day</span> :
							<div className="aotd">
								<h3>
									<Icon name="trophy" />Article of the Day<Icon name="trophy" />
								</h3>
								<ArticleDetails
									article={this.props.aotd.value}
									isUserSignedIn={this.props.isUserSignedIn}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShareArticle}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this.props.onViewComments}
								/>
								<hr />
							</div>}
					{this.props.articles.isLoading ?
						<span>Loading...</span> :
						this.props.articles.errors ?
							<span>Error loading articles</span> :
							<ArticleList>
								{this.props.articles.value.items.map(article =>
									<li key={article.id}>
										<ArticleDetails
											article={article}
											isUserSignedIn={this.props.isUserSignedIn}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShareArticle}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
										/>
									</li>
								)}
							</ArticleList>}
				</div>
				<PageSelector
					pageNumber={this.props.articles.value ? this.props.articles.value.pageNumber : 1}
					pageCount={this.props.articles.value ? this.props.articles.value.pageCount : 1}
					onChange={this.props.onReload}
					disabled={this.props.articles.isLoading}
				/>
			</div>
		);
	}
}