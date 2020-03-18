import ComponentHost, { DomAttachmentDelegate } from './ComponentHost';
import Global from './components/Global';
import ClipboardService from '../../../common/services/ClipboardService';
import DialogService, { State as DialogState } from '../../../common/services/DialogService';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import AsyncTracker from '../../../common/AsyncTracker';

interface Services {
	clipboardService: ClipboardService,
	dialogService: DialogService,
	toasterService: ToasterService
}
type State = DialogState & ToasterState;
export default class GlobalComponentHost extends ComponentHost<Services, State> {
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
				setState: delegate => {
					this.setState(delegate(this._state));
				}
			}),
			toasterService: new ToasterService({
				asyncTracker: new AsyncTracker(),
				setState: (delegate: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
					this.setState(delegate(this._state));
				}
			})
		};
		this.setState({
			dialogs: [],
			toasts: []
		});
	}
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