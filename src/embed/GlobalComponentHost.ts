import { DomAttachmentDelegate } from '../common/shadowDom/ComponentHost';
import Global, { Props as GlobalProps } from './components/Global';
import EmbedComponentHost from './EmbedComponentHost';

type Services = Pick<
	GlobalProps,
	'captcha' | 'clipboardService' | 'dialogService' | 'onCloseOnboarding' | 'onCreateAccount' | 'onCreateAuthServiceAccount' | 'onRequestPasswordReset' | 'onShowToast' | 'onSignIn' | 'onSignInWithAuthService' | 'toasterService'
>;
type State = Pick<
	GlobalProps,
	'article' | 'dialogs' | 'error' | 'onboardingAnalyticsAction' | 'toasts' | 'user'
>;
export default class GlobalComponentHost extends EmbedComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<GlobalProps> | React.ComponentClass<GlobalProps>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Services,
			state: State
		}
	) {
		super(params);
		this._component = Global;
		this._services = params.services;
		this.setState(params.state);
	}
}