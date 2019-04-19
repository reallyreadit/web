import UserArticle from "../../common/models/UserArticle";
import CommentThread from "../../common/models/CommentThread";

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
				.filter(tab => tab.url && new URL(tab.url).hostname === window.reallyreadit.extension.config.web.host)
				.forEach(tab => chrome.tabs.executeScript(
					tab.id,
					{ code: `window.postMessage('${stringifyForLiteral({ type, data })}', '*');` }
				))
		);
	}
	public static notifyExtensionInstalled() {
		this.sendMessage('extensionInstalled');
	}
	public static postComment(comment: CommentThread) {
		this.sendMessage('commentPosted', comment);
	}
	public static updateArticle(article: UserArticle, isCompletionCommit: boolean) {
		this.sendMessage('articleUpdated', { article, isCompletionCommit });
	}
}