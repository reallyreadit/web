import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import { Screen } from '../Root';
import HotTopicsList from '../HotTopicsList';
import LoadingOverlay from '../controls/LoadingOverlay';

function mapToScreenState(hotTopics: Fetchable<HotTopics>) {
	return {
		articleLists: { ['articles']: { ...hotTopics, value: hotTopics.value ? hotTopics.value.articles : null } },
		articles: { ['aotd']: { ...hotTopics, value: hotTopics.value ? hotTopics.value.aotd : null } }
	};
}
export function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: {
		onGetHotTopics: (pageNumber: number, pageSize: number, callback: (hotTopics: Fetchable<HotTopics>) => void) => Fetchable<HotTopics>,
		onGetUser: () => UserAccount | null,
		onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
		onSetScreenState: (key: TScreenKey, state: Partial<Screen>) => void,
		onShareArticle: (article: UserArticle) => void,
		onToggleArticleStar: (article: UserArticle) => Promise<void>,
		onViewComments: (article: UserArticle) => void
	}
) {
	const getHotTopics = (pageNumber: number) => deps.onGetHotTopics(
		pageNumber,
		40,
		hotTopics => {
			deps.onSetScreenState(key, mapToScreenState(hotTopics));
		}
	);
	const reload = (pageNumber: number) => deps.onSetScreenState(key, mapToScreenState(getHotTopics(pageNumber)));
	return {
		create: () => ({ key, ...mapToScreenState(getHotTopics(1)), title: 'Home' }),
		render: (state: Screen) => (
			state.articles['aotd'].isLoading || state.articleLists['articles'].isLoading ?
				<LoadingOverlay /> :
				<HotTopicsList
					aotd={state.articles['aotd']}
					articles={state.articleLists['articles']}
					isUserSignedIn={!!deps.onGetUser()}
					onReadArticle={deps.onReadArticle}
					onLoadPage={reload}
					onShareArticle={deps.onShareArticle}
					onToggleArticleStar={deps.onToggleArticleStar}
					onViewComments={deps.onViewComments}
				/>
		)
	};
}