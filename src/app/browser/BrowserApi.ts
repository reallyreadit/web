import Api, { InitData } from '../common/api/Api';
import Request from '../common/api/Request';
import Fetchable from '../common/api/Fetchable';
import RequestStore from '../common/api/RequestStore';

export default class BrowserApi extends Api {
	constructor(initData: InitData) {
		super(initData.endpoint);
		this._reqStore = new RequestStore(initData.requests);
	}
	private fetchJson<T>(method: 'GET' | 'POST', params: Request) {
		return new Promise<T>((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.withCredentials = true;
			req.addEventListener('load', function () {
				switch (this.status) {
					case 200:
						if (parseInt(this.getResponseHeader('Content-Length'))) {
							resolve(JSON.parse(this.responseText));
						} else {
							resolve();
						}
						break;
					case 400:
						// TODO: update api server to always return JSON on bad request response
						const contentType = this.getResponseHeader('Content-Type');
						if (contentType && contentType.startsWith('application/json')) {
							reject(JSON.parse(this.responseText));
						} else {
							reject([]);
						}
						break;
					case 401:
						// TODO: should probably notify user, sign out and redirect if applicable
						reject(['Unauthenticated']);
						break;
					default:
						reject([]);
						break;
				}
			});
			req.addEventListener('error', function () {
				reject([]);
			});
			if (method === 'POST') {
				req.open(method, this.getUrl(params.path));
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(params.query));
			} else {
				req.open(method, this.getUrl(params.path) + params.getQueryString());
				req.send();
			}
		});
	} 
	protected get<T>(request: Request, callback: (data: Fetchable<T>) => void) {
		if (!this._isInitialized) {
			console.log('Api: fetch[sync/value, async/na]');
			return {
				isLoading: false,
				value: this._reqStore.getData(request) as T
			};
		} else {
			console.log('Api: fetch[sync/loading, async/value]');
			this.fetchJson<T>('GET', request)
				.then(value => callback({ isLoading: false, value }))
				.catch(errors => callback({ isLoading: false, errors }));
			return { isLoading: true };
		}
	}
	protected post<T>(request: Request) {
		return this.fetchJson<T>('POST', request);
	}
	public initialize() : void {
		this._isInitialized = true;
	}
}