import EventPageOptions from '../common/EventPageOptions';
import ContentScriptOptions from '../common/ContentScriptOptions';
import Source from '../common/Source';
import Article from './Article';
import ObjectStore from './ObjectStore';
import ContentPageData from '../common/ContentPageData';

export default class ServerApi {
	private static getUrl(path: string) {
		return 'http://localhost:4001' + path;
	}
	private static parseResponse(request: XMLHttpRequest, handler: (data: any) => void, defaultValue?: any) {
		const contentType = request.getResponseHeader('Content-Type');
		if (contentType && contentType.startsWith('application/json')) {
			handler(JSON.parse(request.responseText));
		} else {
			handler(defaultValue);
		}
	}
	private static fetchJson<T>(method: 'GET' | 'POST', path: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.withCredentials = true;
			req.addEventListener('load', function () {
				if (this.status === 200) {
					ServerApi.parseResponse(this, resolve);
				} else {
					ServerApi.parseResponse(this, reject, []);
				}
			});
			req.addEventListener('error', function () {
				reject([]);
			});
			if (method === 'POST') {
				req.open(method, ServerApi.getUrl(path));
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(data));
			} else {
				// TODO: append querystring from query object
				req.open(method, ServerApi.getUrl(path));
				req.send();
			}
		});
	}
	private _eventPageOptions: EventPageOptions;
	private _contentScriptOptions: ContentScriptOptions;
	private _articles = new ObjectStore<string, Article>('articles', 'local', a => a.slug);
	constructor() {
		try {
			this._eventPageOptions = JSON.parse(localStorage.getItem('eventPageOptions'));
			this._contentScriptOptions = JSON.parse(localStorage.getItem('contentScriptOptions'));
		} catch (ex) {
			ServerApi
				.fetchJson<{
					eventPageOptions: EventPageOptions,
					contentScriptOptions: ContentScriptOptions
				}>('GET', '/Extension/GetOptions')
				.then(opts => {
					this._eventPageOptions = opts.eventPageOptions;
					this._contentScriptOptions = opts.contentScriptOptions;
				});
		}
	}
	private commitToServer(data: ContentPageData) {
		ServerApi
			.fetchJson<{ readState: number[], percentComplete: number }>('POST', '/Extension/Commit', data)
			.then(updatedData => {
				if (updatedData) {
					const article = this._articles.get(data.slug);
					const page = article.pages.find(p => p.number === data.pageNumber);
					page.readState = updatedData.readState;
					page.percentComplete = updatedData.percentComplete;
					this._articles.set(article);
				}
			});
	}
	public findSource(hostname: string) {
		return ServerApi.fetchJson<Source>('GET', '/Extension/FindSource');
	}
	public commit(data: ContentPageData) {
		// merge data
		const article = this._articles.get(data.slug);
		if (article) {
			// compare versions
			const page = article.pages.find(p => p.number === data.pageNumber);
			if (data.percentComplete >= page.percentComplete) {
				// update article
				// - cache
				page.readState = data.readState;
				page.percentComplete = data.percentComplete;
				article.percentComplete = article.pages.reduce((sum, page) => sum += page.percentComplete, 0) / article.pages.length;
				this._articles.set(article);
				// - server
				this.commitToServer(data);
			} else {
				// return newer copy
				return {
					slug: article.slug,
					title: article.title,
					wordCount: page.wordCount,
					readState: page.readState,
					percentComplete: page.percentComplete,
					url: page.url,
					datePublished: article.datePublished,
					author: article.author,
					pageNumber: page.number,
					pageLinks: article.pages.map(p => ({
						url: p.url,
						pageNumber: p.number
					})),
					sourceId: article.sourceId
				};
			}
		} else {
			// add article
			// - cache
			this._articles.set({
				slug: data.slug,
				title: data.title,
				datePublished: data.datePublished,
				author: data.author,
				pages: data.pageLinks
					.filter(p => p.pageNumber !== data.pageNumber)
					.map(p => ({
						url: p.url,
						number: p.pageNumber,
						wordCount: 0,
						readState: [],
						percentComplete: 0
					}))
					.concat([{
						url: data.url,
						number: data.pageNumber,
						wordCount: data.wordCount,
						readState: data.readState,
						percentComplete: data.percentComplete
					}]),
				percentComplete: data.percentComplete / (data.pageLinks.filter(p => p.pageNumber !== data.pageNumber).length + 1),
				sourceId: data.sourceId
			});
			// - server
			this.commitToServer(data);
		}
		return undefined;
	}
	public getArticle(slug: string) {
		return this._articles.get(slug);
	}
	public get eventPageOptions() {
		return this._eventPageOptions;
	}
	public get contentScriptOptions() {
		return this._contentScriptOptions;
	}
}