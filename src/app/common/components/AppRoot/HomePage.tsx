import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import { Screen } from '../Root';
import HotTopicsList from '../HotTopicsList';
import logoText from '../../../../common/svg/logoText';
import Icon from '../../../../common/components/Icon';
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
		onOpenMenu: () => void,
		onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
		onSetScreenState: (key: TScreenKey, state: Partial<Screen>) => void,
		onShareArticle: (article: UserArticle) => void,
		onToggleArticleStar: (article: UserArticle) => Promise<void>,
		onViewComments: (article: UserArticle) => void
	}
) {
	const getHotTopics = () => deps.onGetHotTopics(
		1,
		10,
		hotTopics => {
			deps.onSetScreenState(key, mapToScreenState(hotTopics));
		}
	);
	return {
		create: () => ({ ...mapToScreenState(getHotTopics()), key }),
		render: (state: Screen) => (
			<div className="home-page_3aivep">
				<div className="header">
					<div
						className="logo-container"
						dangerouslySetInnerHTML={{ __html: logoText }}
					></div>
					<Icon
						name="user"
						onClick={deps.onOpenMenu}
					/>
				</div>
				{state.articles['aotd'].isLoading || state.articleLists['articles'].isLoading ?
					<LoadingOverlay position="static" /> :
					<HotTopicsList
						aotd={state.articles['aotd']}
						articles={state.articleLists['articles']}
						isUserSignedIn={!!deps.onGetUser()}
						onReadArticle={deps.onReadArticle}
						onShareArticle={deps.onShareArticle}
						onToggleArticleStar={deps.onToggleArticleStar}
						onViewComments={deps.onViewComments}
					/>}
			</div>
		)
	};
}