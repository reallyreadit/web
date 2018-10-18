import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import { Screen } from '../Root';
import HotTopicsList from '../HotTopicsList';
import logoText from '../../../../common/svg/logoText';
import Icon from '../../../../common/components/Icon';

function mapToScreenState(hotTopics: Fetchable<HotTopics>) {
	return {
		articleLists: { ['articles']: { ...hotTopics, value: hotTopics.value ? hotTopics.value.articles : null } },
		articles: { ['aotd']: { ...hotTopics, value: hotTopics.value ? hotTopics.value.aotd : null } }
	};
}
export function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: {
		onGetHotTopics: (pageNumber: number, callback: (hotTopics: Fetchable<HotTopics>) => void) => Fetchable<HotTopics>,
		onGetUser: () => UserAccount | null,
		onOpenMenu: () => void,
		onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
		onSetScreenState: (key: TScreenKey, state: Partial<Screen>) => void,
		onShareArticle: (article: UserArticle) => void,
		onToggleArticleStar: (article: UserArticle) => Promise<void>,
		onViewComments: (article: UserArticle) => void
	}
) {
	const getHotTopics = (pageNumber: number) => deps.onGetHotTopics(
		pageNumber,
		hotTopics => {
			deps.onSetScreenState(key, mapToScreenState(hotTopics));
		}
	);
	const reload = (pageNumber: number) => deps.onSetScreenState(key, mapToScreenState(getHotTopics(pageNumber)));
	return {
		create: () => ({ ...mapToScreenState(getHotTopics(1)), key }),
		render: (state: Screen) => (
			<div className="home-page_3aivep">
				<div className="header">
					<div
						className="logo-container"
						dangerouslySetInnerHTML={{ __html: logoText }}
					></div>
					<Icon
						name="three-bars"
						onClick={deps.onOpenMenu}
					/>
				</div>
				<HotTopicsList
					aotd={state.articles['aotd']}
					articles={state.articleLists['articles']}
					isUserSignedIn={!!deps.onGetUser()}
					onReadArticle={deps.onReadArticle}
					onReload={reload}
					onShareArticle={deps.onShareArticle}
					onToggleArticleStar={deps.onToggleArticleStar}
					onViewComments={deps.onViewComments}
				/>
			</div>
		)
	};
}