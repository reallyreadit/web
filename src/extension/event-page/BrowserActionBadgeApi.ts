import UserArticle from '../../common/models/UserArticle';

enum Color {
	Default = '#555555',
	Read = 'LimeGreen',
	Unread = 'DarkGray'
}
interface LoadingAnimation {
	interval: number,
	tabId: number
}
function createLoadingAnimation(tabId: number) {
	let frameIndex = 0;
	let frameCount = 5;
	chrome.browserAction.setBadgeBackgroundColor(
		{
			color: Color.Default,
			tabId
		}
	);
	return {
		interval: window.setInterval(
			() => {
				let text = '';
				for (let i = 0; i < frameCount - 1; i++) {
					if (i === frameIndex) {
						text += '.';
					} else {
						text += ' ';
					}
				}
				chrome.browserAction.setBadgeText({
					tabId,
					text
				});
				frameIndex = ++frameIndex % frameCount;
			},
			150
		),
		tabId
	};
}
export default class BrowserActionBadgeApi {
	private readonly _animations: LoadingAnimation[] = [];
	private cancelAnimation(tabId: number) {
		const animation = this.getAnimation(tabId);
		if (animation) {
			clearInterval(animation.interval);
			this._animations.splice(
				this._animations.indexOf(animation),
				1
			);
		}
	}
	private getAnimation(tabId: number) {
		return this._animations.find(
			animation => animation.tabId === tabId
		);			
	}
	public setDefault(tabId: number) {
		this.cancelAnimation(tabId);
		chrome.browserAction.setBadgeBackgroundColor({
			color: Color.Default,
			tabId
		});
		chrome.browserAction.setBadgeText({
			tabId,
			text: ''
		});
	}
	public setLoading(tabId: number) {
		if (this.getAnimation(tabId)) {
			return;
		}
		this._animations.push(
			createLoadingAnimation(tabId)
		);
	}
	public setReading(tabId: number, article: Pick<UserArticle, 'isRead' | 'percentComplete'>) {
		this.cancelAnimation(tabId);
		chrome.browserAction.setBadgeBackgroundColor({
			color: article.isRead ?
				Color.Read :
				Color.Unread,
			tabId
		});
		chrome.browserAction.setBadgeText({
			tabId,
			text: Math.floor(article.percentComplete) + '%'
		});
	}
}