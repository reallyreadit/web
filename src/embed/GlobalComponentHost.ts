import { DomAttachmentDelegate } from '../common/shadowDom/ComponentHost';
import Global, { Props as GlobalProps } from './components/Global';
import UserArticle from '../common/models/UserArticle';
import EmbedComponentHost from './EmbedComponentHost';
import UserAccount from '../common/models/UserAccount';
import { Dialog } from '../common/services/DialogService';
import { Toast } from '../common/components/Toaster';

type Services = Pick<
	GlobalProps,
	'captcha' | 'clipboardService' | 'dialogService' | 'imageBasePath' | 'onCloseOnboarding' | 'onCreateAccount' | 'onCreateAuthServiceAccount' | 'onRequestPasswordReset' | 'onSignIn' | 'onSignInWithApple' | 'onSignInWithTwitter' | 'toasterService'
>;
type State = Pick<
	GlobalProps,
	'article' | 'dialogs' | 'error' | 'isOnboarding' | 'toasts' | 'user'
>;
export default class GlobalComponentHost extends EmbedComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<GlobalProps> | React.ComponentClass<GlobalProps>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Services
		}
	) {
		super(params);
		this._component = Global;
		this._services = params.services;
	}
	public articleUpdated(article: UserArticle) {
		this.setState({
			article
		});
	}
	public dialogsUpdated(dialogs: Dialog[]) {
		this.setState({
			dialogs
		});
	}
	public errorUpdated(error: string) {
		this.setState({
			error
		});
	}
	public initialize(state: State) {
		this.setState(state);
		return this;
	}
	public isOnboardingUpdated(isOnboarding: boolean) {
		this.setState({
			isOnboarding
		});
	}
	public toastsUpdated(toasts: Toast[]) {
		this.setState({
			toasts
		});
	}
	public userUpdated(user: UserAccount | null) {
		this.setState({
			user
		});
	}
}