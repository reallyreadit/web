import UserArticle from "../../common/models/UserArticle";
import Fetchable from "../../common/Fetchable";

enum Color {
	Default = '#555555',
	Read = 'LimeGreen',
	Unread = 'DarkGray'
}
export default class BrowserActionBadgeApi {
	private _frameIndex = 0;
	private _frameCount = 5;
	private _animationInterval: number;
	public set(article?: Fetchable<UserArticle>) {
		if (!article || !article.isLoading) {
			if (this._animationInterval) {
				window.clearInterval(this._animationInterval);
				this._animationInterval = undefined;
				this._frameIndex = 0;
			}
			if (article && article.value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: article.value.isRead ? Color.Read : Color.Unread
				});
				chrome.browserAction.setBadgeText({ text: Math.floor(article.value.percentComplete) + '%' });
			} else {
				chrome.browserAction.setBadgeBackgroundColor({ color: Color.Default });
				chrome.browserAction.setBadgeText({ text: '' });
			}
		} else if (!this._animationInterval) {
			this._animationInterval = window.setInterval(() => {
				let text = '';
				for (let i = 0; i < this._frameCount - 1; i++) {
					if (i === this._frameIndex) {
						text += '.';
					} else {
						text += ' ';
					}
				}
				chrome.browserAction.setBadgeBackgroundColor({ color: Color.Default });
				chrome.browserAction.setBadgeText({ text });
				this._frameIndex = ++this._frameIndex % this._frameCount;
			}, 150);
		}
	}
}