import { DomAttachmentDelegate } from '../../../common/shadowDom/ComponentHost';
import Global from './components/Global';
import ClipboardService from '../../../common/services/ClipboardService';
import DialogService, { DialogServiceState } from '../../../common/services/DialogService';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import AsyncTracker from '../../../common/AsyncTracker';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseUrlForRoute, findRouteByKey } from '../../../common/routing/Route';
import { createUrl } from '../../../common/HttpEndpoint';
import routes from '../../../common/routing/routes';
import ScreenKey from '../../../common/routing/ScreenKey';
import UserArticle from '../../../common/models/UserArticle';
import ExtensionComponentHost from './ExtensionComponentHost';

interface Services {
	clipboardService: ClipboardService,
	dialogService: DialogService<{}>,
	toasterService: ToasterService
}
type State = DialogServiceState & ToasterState & {
	error: string | null
};
export default class GlobalComponentHost extends ExtensionComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate
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
				setState: (delegate, callback) => {
					this
						.setState(
							delegate(this._state)
						)
						.then(callback);
				}
			}),
			toasterService: new ToasterService({
				asyncTracker: new AsyncTracker(),
				setState: (delegate: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
					this.setState(delegate(this._state));
				}
			})
		};
	}
	private openInNewTab(url: string) {
		window.open(url, '_blank');
	}
	public initialize() {
		this.setState({
			dialogs: [],
			error: null,
			toasts: []
		});
		return this;
	}
	public readonly createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.extension.config.webServer, path);
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