import UserArticle from "../../common/models/UserArticle";

function stringifyForLiteral(obj: {}) {
	return JSON
		.stringify(obj)
		.replace(/\\/g, '\\\\')
		.replace(/'/g, '\\\'');
}
export default class {
	private static sendMessage(type: string, data: {} = null) {
		chrome.tabs.query(
			{},
			tabs => tabs
				.filter(tab => tab.url && [config.web.host, 'readup.com'].includes(new URL(tab.url).hostname))
				.forEach(tab => chrome.tabs.executeScript(
					tab.id,
					{ code: `window.postMessage('${stringifyForLiteral({ type, data })}', '*');` }
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