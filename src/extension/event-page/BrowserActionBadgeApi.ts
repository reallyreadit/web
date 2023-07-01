import UserArticle from '../../common/models/UserArticle';

enum Color {
	Default = '#555555',
	Read = '#32CD32',
	Unread = '#A9A9A9',
}

export default class BrowserActionBadgeApi {
	private readonly _loadingAnimationFrameCount = 5;
	public async setDefault(tabId: number) {
		await chrome.action.setBadgeBackgroundColor({
			color: Color.Default,
			tabId,
		});
		await chrome.action.setBadgeText({
			tabId,
			text: '',
		});
	}
	public async setLoading(tabId: number, tick: number) {
		console.log(
			`[BrowserActionBadgeApi] creating loading animation for tab # ${tabId}`
		);
		tick %= this._loadingAnimationFrameCount;
		let text = '';
		for (let i = 0; i < this._loadingAnimationFrameCount - 1; i++) {
			if (i === tick) {
				text += '.';
			} else {
				// use punctuation space (U+2008) since Firefox trims regular space
				text += String.fromCharCode(0x2008);
			}
		}
		await chrome.action.setBadgeText({
			tabId,
			text,
		});
	}
	public async setReading(
		tabId: number,
		article: Pick<UserArticle, 'isRead' | 'percentComplete'>
	) {
		console.log(
			`[BrowserActionBadgeApi] setting progress at ${Math.floor(
				article.percentComplete
			)}% for tab # ${tabId}`
		);
		await chrome.action.setBadgeBackgroundColor({
			color: article.isRead ? Color.Read : Color.Unread,
			tabId,
		});
		await chrome.action.setBadgeText({
			tabId,
			text: Math.floor(article.percentComplete) + '%',
		});
	}
}
