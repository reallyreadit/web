export default class AuthServiceBrowserPopup {
	private _popup: Window | null;
	public load(url: string) {
		if (!this._popup) {
			return Promise.reject(
				new Error('Popup has not been opened.')
			);
		}
		this._popup.location.href = url;
		return new Promise(
			(resolve, reject) => {
				const onClosePollingInterval = window.setInterval(
					() => {
						if (!this._popup.closed) {
							return;
						}
						window.clearInterval(onClosePollingInterval);
						resolve();
					},
					1000
				);
			}
		);
	}
	public open() {
		if (this._popup) {
			return;
		}
		this._popup = window.open(
			'',
			'_blank',
			'height=300,location=0,menubar=0,toolbar=0,width=400'
		);
	}
}