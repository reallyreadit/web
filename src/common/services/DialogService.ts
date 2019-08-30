interface Dialog {
	element: React.ReactNode,
	isClosing: boolean
}
export interface State {
	dialog?: Dialog
}
export default class DialogService {
	private readonly _setState: (state: (prevState: State) => Pick<State, keyof State>) => void;
	constructor(
		{
			setState
		}: {
			setState: (state: (prevState: State) => Pick<State, keyof State>) => void
		}
	) {
		this._setState = setState;
	}
	public closeDialog = () => {
		this._setState(prevState => ({ dialog: { ...prevState.dialog, isClosing: true } }));
	};
	public openDialog = (dialog: React.ReactNode) => {
		this._setState(
			() => ({
				dialog: {
					element: dialog,
					isClosing: false
				}
			})
		);
	};
	public removeDialog = () => {
		this._setState(() => ({ dialog: null }));
	};
}