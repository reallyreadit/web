import ServerApi, { InitData } from '../common/serverApi/ServerApi';
import Request from '../common/serverApi/Request';
import Fetchable from '../common/serverApi/Fetchable';
import RequestStore from '../common/serverApi/RequestStore';

export default class extends ServerApi {
	constructor(initData: InitData) {
		super(initData.endpoint);
		this._reqStore = new RequestStore(initData.requests);
	}
	private fetchJson<T>(method: 'GET' | 'POST', params: Request) {
		return new Promise<T>((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.withCredentials = true;
			req.addEventListener('load', function () {
				if (this.status === 200 || this.status === 400) {
					const contentType = this.getResponseHeader('Content-Type');
					let object: any;
					if (contentType && contentType.startsWith('application/json')) {
						object = JSON.parse(this.responseText);
					}
					if (this.status === 200) {
						if (object) {
							resolve(object);
						} else {
							resolve();
						}
					} else {
						reject(object || []);
					}
				} else if (this.status === 401) {
					reject(['Unauthenticated']);
				} else {
					reject([]);
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
			return {
				isLoading: false,
				value: this._reqStore.getData(request) as T
			};
		} else {
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