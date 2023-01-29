import UserArticle from '../../common/models/UserArticle';

enum Color {
	Default = '#555555',
	Read = '#32CD32',
	Unread = '#A9A9A9',
}
type OptionalTabId = number | null;
interface LoadingAnimation {
	interval: number;
	tabId: OptionalTabId;
}

const manifestVersion = chrome.runtime.getManifest().manifest_version;
const browserActionApi =
	manifestVersion > 2 ? chrome.action : chrome.browserAction;

function createLoadingAnimation(tabId: OptionalTabId) {
	if (typeof window != 'object') {
		// Manifest v3 service workers don't have window.setInterval
		// We can't use chrome alarms, since those are limited to 1 minute.
		return null;
	}
	let frameIndex = 0;
	let frameCount = 5;
	browserActionApi.setBadgeBackgroundColor({
		color: Color.Default,
		tabId,
	});
	return {
		interval: window.setInterval(() => {
			let text = '';
			for (let i = 0; i < frameCount - 1; i++) {
				if (i === frameIndex) {
					text += '.';
				} else {
					// use punctuation space (U+2008) since Firefox trims regular space
					text += String.fromCharCode(0x2008);
				}
			}
			browserActionApi.setBadgeText({
				tabId,
				text,
			});
			frameIndex = ++frameIndex % frameCount;
		}, 150),
		tabId,
	};
}
export default class BrowserActionBadgeApi {
	private readonly _animations: LoadingAnimation[] = [];
	private cancelAnimation(tabId: OptionalTabId) {
		const animation = this.getAnimation(tabId);
		if (animation) {
			console.log(
				`[BrowserActionBadgeApi] cancelling loading animation for tab # ${tabId}`
			);
			clearInterval(animation.interval);
			this._animations.splice(this._animations.indexOf(animation), 1);
		}
	}
	private getAnimation(tabId: OptionalTabId) {
		return this._animations.find((animation) => animation.tabId === tabId);
	}
	public setDefault(tabId: OptionalTabId = null) {
		this.cancelAnimation(tabId);
		browserActionApi.setBadgeBackgroundColor({
			color: Color.Default,
			tabId,
		});
		browserActionApi.setBadgeText({
			tabId,
			text: '',
		});
	}
	public setLoading(tabId: OptionalTabId = null) {
		if (this.getAnimation(tabId)) {
			return;
		}
		if (typeof window != 'object') {
			// Can't call window.setInterval in manifest v3
			// This disables the creation of loading animations.
			// There is no good alternative, chrome.alarms are only available
			// starting from once per minute.
			return;
		}

		console.log(
			`[BrowserActionBadgeApi] creating loading animation for tab # ${tabId}`
		);
		this._animations.push(createLoadingAnimation(tabId));
	}
	public setReading(
		tabId: number,
		article: Pick<UserArticle, 'isRead' | 'percentComplete'>
	) {
		console.log(
			`[BrowserActionBadgeApi] setting progress at ${Math.floor(
				article.percentComplete
			)}% for tab # ${tabId}`
		);
		this.cancelAnimation(tabId);
		browserActionApi.setBadgeBackgroundColor({
			color: article.isRead ? Color.Read : Color.Unread,
			tabId,
		});
		browserActionApi.setBadgeText({
			tabId,
			text: Math.floor(article.percentComplete) + '%',
		});
	}
}
