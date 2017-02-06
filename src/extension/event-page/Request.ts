export default class Request {
	constructor (
		public readonly type: 'FindSource' | 'GetUserArticle' | 'CommitReadState',
		public readonly tabId: number,
		public readonly articleId: string,
		public readonly method: 'GET' | 'POST',
		public readonly path: string,
		public readonly query?: {}
	) {}
	public getQueryString() {
		// TODO: support nested objects and arrays
		if (this.query) {
			const kvps = Object.keys(this.query).map(key => encodeURIComponent(key) + '=' + encodeURIComponent((this.query as { [key: string]: any })[key]));
			if (kvps.length) {
				return '?' + kvps.join('&');
			}
		}
		return '';
	}
}