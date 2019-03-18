import * as React from 'react';
import { Screen } from '../Root';
import { SharedState } from '../BrowserRoot';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import OnboardingScreen from './OnboardingScreen';
import { formatFetchable } from '../../../../common/format';

interface Props {
	articleSlug: string,
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	onCopyTextToClipboard: (text: string) => void,
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>
	onInstallExtension: () => void,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	onViewHomeScreen: () => void,
	user: UserAccount | null
}
class ReadScreen extends React.PureComponent<Props, { article: Fetchable<UserArticle> }> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			article: props.onGetArticle(
				{ slug: props.articleSlug },
				article => {
					this.setState({ article });
				}
			)
		};
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
		window.location.href = this.state.article.value.url;
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
								formatFetchable(this.state.article, article => `"${article.title}"`, 'Loading...') :
								null
						),
						unsupportedBypass: formatFetchable(
							this.state.article,
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
	deps: Pick<Props, Exclude<keyof Props, 'articleSlug' | 'isExtensionInstalled' | 'user'>>
) {
	return {
		create: (location: RouteLocation) => ({ key, location, title: 'Read Article' }),
		render: (screenState: Screen, sharedState: SharedState) => {
			const pathParams = findRouteByKey(routes, ScreenKey.Read).getPathParams(screenState.location.path);
			return (
				<ReadScreen {
					...{
						...deps,
						...sharedState,
						articleSlug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug']
					}
				} />
			);
		}
	};
}