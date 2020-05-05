import ComponentHost, { DomAttachmentDelegate } from './ComponentHost';
import Global from './components/Global';
import ClipboardService from '../../../common/services/ClipboardService';
import DialogService, { State as DialogState } from '../../../common/services/DialogService';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import AsyncTracker from '../../../common/AsyncTracker';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseUrlForRoute, findRouteByKey } from '../../../common/routing/Route';
import { createUrl } from '../../../common/HttpEndpoint';
import routes from '../../../common/routing/routes';
import ScreenKey from '../../../common/routing/ScreenKey';
import UserArticle from '../../../common/models/UserArticle';
import { Props as HeaderProps } from '../../../common/components/ReaderHeader';
import ScrollService from '../../../common/services/ScrollService';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';

interface Services {
	clipboardService: ClipboardService,
	dialogService: DialogService,
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void,
	toasterService: ToasterService
}
type State = DialogState & ToasterState & {
	error: string | null,
	header: Pick<HeaderProps, 'article' | 'isHidden'>
};
export default class GlobalComponentHost extends ComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Pick<Services, 'onReportArticleIssue'>
		}
	) {
		super(params);
		this._component = Global;
		this._services = {
			clipboardService: new ClipboardService(
				(content, intent) => {
					this._services.toasterService.addToast(content, intent);
				}
			),
			dialogService: new DialogService({
				setState: delegate => {
					this.setState(delegate(this._state));
				}
			}),
			onReportArticleIssue: params.services.onReportArticleIssue,
			toasterService: new ToasterService({
				asyncTracker: new AsyncTracker(),
				setState: (delegate: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
					this.setState(delegate(this._state));
				}
			})
		};
		new ScrollService({
			setBarVisibility: isVisible => {
				if (!this._state || this._state.header.isHidden !== isVisible) {
					return;
				}
				this.setState({
					header: {
						...this._state.header,
						isHidden: !isVisible
					}
				});
			}
		});
	}
	private openInNewTab(url: string) {
		window.open(url, '_blank');
	}
	public articleUpdated(article: UserArticle) {
		this.setState({
			header: {
				...this._state.header,
				article: {
					isLoading: false,
					value: article
				}
			}
		});
	}
	public initialize(
		{ header }: Pick<State, 'header'>
	) {
		this.setState({
			dialogs: [],
			error: null,
			header,
			toasts: []
		});
		return this;
	}
	public readonly createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.extension.config.web, path);
	public readonly handleShareRequest = () => {
		return {
			channels: [
				ShareChannel.Clipboard,
				ShareChannel.Email,
				ShareChannel.Twitter
			]
		};
	};
	public readonly navTo = (url: string) => {
		const result = parseUrlForRoute(url);
		if (
			(result.isInternal && result.route) ||
			(!result.isInternal && result.url)
		) {
			this.openInNewTab(result.url.href);
			return true;
		}
		return false;
	}
	public showError(error: string) {
		this.setState({
			error
		});
	}
	public readonly viewComments = (article: Pick<UserArticle, 'slug'>) => {
		const [sourceSlug, articleSlug] = article.slug.split('_');
		this.openInNewTab(
			this.createAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Comments).createUrl({
					['articleSlug']: articleSlug,
					['sourceSlug']: sourceSlug
				})
			)
		);
	};
	public readonly viewProfile = (userName: string) => {
		this.openInNewTab(
			this.createAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName })
			)
		);
	};
	public get clipboard() {
		return this._services.clipboardService;
	}
	public get dialogs() {
		return this._services.dialogService;
	}
	public get toaster() {
		return this._services.toasterService;
	}
}