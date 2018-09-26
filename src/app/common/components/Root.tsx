import * as React from 'react';
import UserAccount from '../../../common/models/UserAccount';
import Captcha from '../Captcha';
import { Toast, Intent } from './Toaster';
import ServerApi from '../serverApi/ServerApi';
import { IconName } from '../../../common/components/Icon';
import Fetchable from '../serverApi/Fetchable';
import HotTopics from '../../../common/models/HotTopics';
import UserArticle from '../../../common/models/UserArticle';
import PageResult from '../../../common/models/PageResult';
import HotTopicsPage from './HotTopicsPage';

export interface Props {
	serverApi: ServerApi,
	captcha: Captcha,
	path: string,
	user: UserAccount
}
enum ScreenKey {
	Home,
	Starred,
	History,
	Leaderboards
}
interface Screen {
	articleLists?: { [key: string]: Fetchable<PageResult<UserArticle>> },
	articles?: { [key: string]: Fetchable<UserArticle> },
	key: ScreenKey,
	render: () => React.ReactNode,
	title?: string
}
const screenRoutes: {
	path: string,
	screenKey: ScreenKey
}[] = [{
	path: '/',
	screenKey: ScreenKey.Home
}];
export default abstract class <P = {}, S = {}> extends React.Component<
	P & Props,
	S & {
		screens: Screen[],
		toasts: Toast[],
		user: UserAccount | null
	}
> {
	protected readonly _addToast = (text: string, intent: Intent) => {
		const toast = {
			text,
			intent,
			timeoutHandle: window.setTimeout(() => {
				const toasts = this.state.toasts.slice();
				toasts[toasts.indexOf(toast)] = { ...toast, remove: true };
				this.setState({ toasts });
			}, 5000),
			remove: false
		};
		this.setState({ toasts: [...this.state.toasts, toast] });
	};
	protected readonly _createAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>;
	private readonly _navItems: {
		iconName: IconName,
		label: string,
		screenKey: ScreenKey
	}[] = [{
		iconName: 'home',
		label: 'Home',
		screenKey: ScreenKey.Home
	}, {
		iconName: 'star',
		label: 'Starred',
		screenKey: ScreenKey.Starred
	}, {
		iconName: 'clock',
		label: 'History',
		screenKey: ScreenKey.History
	}, {
		iconName: 'line-chart',
		label: 'Stats',
		screenKey: ScreenKey.Leaderboards
	}];
	protected readonly _popScreen = () => {
		this.setState({ screens: this.state.screens.slice(0, this.state.screens.length - 2) });
	};
	protected readonly _readArticle = (article: UserArticle) => {

	};
	protected readonly _removeToast = (timeoutHandle: number) => {
		this.setState({
			toasts: this.state.toasts.filter(toast => toast.timeoutHandle !== timeoutHandle)
		});
	};
	protected readonly _resendConfirmationEmail = () => {
		return this.props.serverApi
			.resendConfirmationEmail()
			.then(() => {
				this._addToast('Confirmation email sent', Intent.Success);
			})
			.catch((errors: string[]) => {
				this._addToast(
					errors.includes('ResendLimitExceeded') ?
						'Error sending email.\nPlease try again in a few minutes.' :
						'Error sending email.\nPlease try again later.',
					Intent.Danger
				);
			});
	};
	protected readonly _screenCreatorMap: { [P in ScreenKey]: () => Screen } = {
		[ScreenKey.Home]: () => {
			function mapToGlobalState(hotTopics: Fetchable<HotTopics>) {
				return {
					articleLists: { articles: { ...hotTopics, value: hotTopics.value ? hotTopics.value.articles : null } },
					articles: { aotd: { ...hotTopics, value: hotTopics.value ? hotTopics.value.aotd : null } }
				};
			}
			const load = (pageNumber: number) => {
				return this.props.serverApi.listHotTopics(
					pageNumber,
					hotTopics => this.setScreenState(
						ScreenKey.Home,
						mapToGlobalState(hotTopics)
					)
				);
			};
			const hotTopics = load(1);
			return {
				...mapToGlobalState(hotTopics),
				key: ScreenKey.Home,
				render: () => {
					const screen = this.getScreen(ScreenKey.Home);
					return (
						<HotTopicsPage
							aotd={screen.articles.aotd}
							articles={screen.articleLists.articles}
							isUserSignedIn={!!this.state.user}
							onReadArticle={this._readArticle}
							onReload={load}
							onShareArticle={this._shareArticle}
							onToggleArticleStar={this._toggleArticleStar}
							onViewComments={this._viewComments}
						/>
					);
				}
			};
		},
		[ScreenKey.Starred]: () => ({
			key: ScreenKey.Starred,
			render: () => {
				return <div></div>;
			}
		}),
		[ScreenKey.History]: () => ({
			key: ScreenKey.History,
			render: () => {
				return <div></div>;
			}
		}),
		[ScreenKey.Leaderboards]: () => ({
			key: ScreenKey.Leaderboards,
			render: () => {
				return <div></div>;
			}
		})
	};
	protected readonly _shareArticle = (article: UserArticle) => {

	};
	protected readonly _signIn: (email: string, password: string) => Promise<void>;
	protected readonly _signOut: () => Promise<void>;
	protected readonly _toggleArticleStar = (article: UserArticle) => {
		return (article.dateStarred ?
			this.props.serverApi.unstarArticle :
			this.props.serverApi.starArticle)(article.id);
	};
	protected readonly _viewAdminPage = () => {

	};
	protected readonly _viewComments = (article: UserArticle) => {

	};
	protected readonly _viewInbox = () => {

	};
	protected readonly _viewSettings = () => {

	};
	constructor(props: P & Props) {
		super(props);
		this._createAccount = this.createAccount.bind(this);
		this._signIn = this.signIn.bind(this);
		this._signOut = this.signOut.bind(this);
	}
	private getScreen(key: ScreenKey) {
		return this.state.screens.find(screen => screen.key === key);
	}
	private setScreenState(key: ScreenKey, state: Partial<Screen>) {
		const
			screens = this.state.screens.slice(),
			screen = screens.find(screen => screen.key === key);
		screens.splice(screens.indexOf(screen), 1, { ...screen, ...state });
		this.setState({ screens });
	}
	protected createAccount(name: string, email: string, password: string, captchaResponse: string) {
		return this.props.serverApi
			.createUserAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this._addToast('Welcome to reallyread.it!\nPlease check your email and confirm your address.', Intent.Success);
				ga('send', {
					hitType: 'event',
					eventCategory: 'UserAccount',
					eventAction: 'create',
					eventLabel: userAccount.name
				});
				return userAccount;
			});
	}
	protected createScreen(path: string) {
		return this._screenCreatorMap[screenRoutes.find(route => route.path === path).screenKey]();
	}
	protected getNavItems() {
		return this._navItems
			.map(item => ({
				iconName: item.iconName,
				label: item.label,
				isSelected: this.state.screens[0].key === item.screenKey
			}));
	}
	protected signIn(email: string, password: string) {
		return this.props.serverApi.signIn(email, password);
	}
	protected signOut() {
		return this.props.serverApi.signOut();
	}
	public componentWillUnmount() {
		this.state.toasts.forEach(toast => window.clearTimeout(toast.timeoutHandle));
	}
}