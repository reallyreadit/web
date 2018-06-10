import UserArticle from "../../common/models/UserArticle";

export default class {
	private static sendMessage(type: string, data: {} = null) {
		chrome.tabs.query(
			{},
			tabs => tabs
				.filter(tab => tab.url && new URL(tab.url).hostname === config.web.host)
				.forEach(tab => chrome.tabs.executeScript(
					tab.id,
					{ code: `window.postMessage('${JSON.stringify({ type, data }).replace(/'/g, '\\\'')}', '*');` }
				))
		);
	}
	public static notifyExtensionInstalled() {
		this.sendMessage('extensionInstalled');
	}
	public static updateArticle(article: UserArticle, isCompletionCommit: boolean) {
		this.sendMessage('articleUpdated', { article, isCompletionCommit });
	}
}