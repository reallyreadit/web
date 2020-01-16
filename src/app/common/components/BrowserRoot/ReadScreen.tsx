import * as React from 'react';
import { Screen, TemplateSection } from '../Root';
import { SharedState } from '../BrowserRoot';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import OnboardingScreen from './OnboardingScreen';
import { formatFetchable } from '../../../../common/format';
import produce from 'immer';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';

interface Props {
	article: Fetchable<UserArticle>,
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: (analyticsAction: string) => void,
	onOpenSignInDialog: (analyticsAction: string) => void,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onViewHomeScreen: () => void,
	user: UserAccount | null
}
class ReadScreen extends React.PureComponent<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterExtensionChangeHandler((isInstalled: boolean) => {
				if (isInstalled && this.props.user) {
					this.navigateToArticle();
				}
			}),
			props.onRegisterUserChangeHandler((user: UserAccount | null) => {
				if (user && this.props.isExtensionInstalled) {
					this.navigateToArticle();
				}
			})
		);
	}
	private navigateToArticle() {
		if (this.props.article.value) {
			window.location.href = this.props.article.value.url;
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<OnboardingScreen
				{
					...{
						...this.props,
						description: (
							!this.props.user || this.props.isExtensionInstalled === false ?
								formatFetchable(this.props.article, article => `"${article.title}"`, 'Loading...') :
								null
						),
						errorMessage: (
							this.props.article.errors ?
								'Error loading article.' :
								null
						),
						unsupportedBypass: formatFetchable(
							this.props.article,
							article => (
								<a href={article.url}>Continue to publisher's site</a>
							),
							'Loading...'
						)
					}
				}
			/>
		);
	}
}
export default function createReadScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'article' | 'isExtensionInstalled' | 'user'>> & {
		onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
	}
) {
	return {
		create: (id: number, location: RouteLocation) => {
			const
				pathParams = findRouteByLocation(routes, location, unroutableQueryStringKeys).getPathParams(location.path),
				article = deps.onGetArticle(
					{ slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug'] },
					article => {
						deps.onSetScreenState(id, produce<Screen<Fetchable<UserArticle>>>(currentState => {
							currentState.componentState = article;
							if (article.value) {
								currentState.title = article.value.title;
							} else {
								currentState.title = 'Article not found';
							}
						}));
					}
				);
			return {
				id,
				componentState: article,
				key,
				location,
				templateSection: TemplateSection.None,
				title: formatFetchable(article, article => article.title, 'Loading...', 'Article not found.')
			};
		},
		render: (screenState: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => {
			return (
				<ReadScreen {
					...{
						...deps,
						...sharedState,
						article: screenState.componentState
					}
				} />
			);
		}
	};
}