export default class BrowserActionBadgeApi {
	private _frameIndex = 0;
	private _frameCount = 5;
	private _animationInterval: number;
	constructor() {
		chrome.browserAction.setBadgeBackgroundColor({ color: '#555555' });
	}
	public set(commentCount?: number | 'loading') {
		if (typeof commentCount === 'number' || !commentCount) {
			if (this._animationInterval) {
				window.clearInterval(this._animationInterval);
				this._animationInterval = undefined;
				this._frameIndex = 0;
			}
			chrome.browserAction.setBadgeText({ text: typeof commentCount === 'number' ? commentCount.toString() : '' });
		} else if (commentCount === 'loading' && !this._animationInterval) {
			this._animationInterval = window.setInterval(() => {
				let text = '';
				for (let i = 0; i < this._frameCount - 1; i++) {
					if (i === this._frameIndex) {
						text += '.';
					} else {
						text += ' ';
					}
				}
				chrome.browserAction.setBadgeText({ text });
				this._frameIndex = ++this._frameIndex % this._frameCount;
			}, 150);
		}
	}
}