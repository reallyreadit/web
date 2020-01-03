export interface Dialog {
	element: React.ReactNode,
	key: number,
	state: 'opening' | 'opened' | 'closing'
}
export interface State {
	dialogs: Dialog[]
}
export default class DialogService {
	private _key = 0;
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
		this._setState(
			prevState => {
				const dialogs = prevState.dialogs.slice();
				dialogs.splice(
					dialogs.length - 1,
					1,
					{
						...dialogs[dialogs.length - 1],
						state: 'closing'
					}
				);
				return {
					dialogs
				};
			}
		);
	};
	public createDialog(dialogElement: React.ReactNode): Dialog {
		return {
			element: dialogElement,
			key: this._key++,
			state: 'opening'
		};
	}
	public handleTransitionCompletion = (key: number, transition: 'closing' | 'opening') => {
		switch (transition) {
			case 'closing':
				this._setState(
					prevState => {
						const dialogs = prevState.dialogs.slice();
						dialogs.splice(
							dialogs.findIndex(dialog => dialog.key === key),
							1
						);
						if (!dialogs.length) {
							this._key = 0;
						}
						return {
							dialogs
						}
					}
				);
				break;
			case 'opening':
				this._setState(
					prevState => {
						const
							dialogs = prevState.dialogs.slice(),
							dialog = dialogs.find(dialog => dialog.key === key);
						dialogs.splice(
							dialogs.indexOf(dialog),
							1,
							{
								...dialog,
								state: 'opened'
							}
						);
						return {
							dialogs
						}
					}
				);
				break;
		}
	};
	public openDialog = (dialogElement: React.ReactNode, method: 'push' | 'replace' = 'replace') => {
		this._setState(
			prevState => {
				const dialogs = prevState.dialogs.slice();
				dialogs.push(this.createDialog(dialogElement));
				if (method === 'replace' && dialogs.length > 1) {
					dialogs.splice(
						dialogs.length - 2,
						1,
						{
							...dialogs[dialogs.length - 2],
							state: 'closing'
						}
					);
				}
				return {
					dialogs
				};
			}
		);
	};
}