import * as request from 'request';
import Api from '../common/api/Api';
import Fetchable from '../common/api/Fetchable';
import Request from '../common/api/Request';
import RequestStore from '../common/api/RequestStore';
import Endpoint from '../common/api/Endpoint';

export default class ServerApi extends Api {
	private _cookie: string;
	constructor(endpoint: Endpoint, cookie: string) {
		super(endpoint);
		this._cookie = cookie;
		this._reqStore = new RequestStore();
	}
	public fetchJson<T>(method: 'GET' | 'POST', params: Request) {
		return new Promise<T>((resolve, reject) => request({
			method,
			uri: this._endpoint.scheme + '://' + this._endpoint.host + ':' + this._endpoint.port + params.path + params.getQueryString(),
			headers: this._cookie ? { 'Cookie': this._cookie } : {},
			json: true,
			callback: (error, res, body) => {
				switch (res.statusCode) {
					case 200:
						resolve(body);
						break;
					case 400:
						reject(body);
						break;
					case 401:
						reject(['Unauthenticated']);
						break;
					default:
						reject([]);
						break;
				}
			}
		}));
	}
	protected get<T>(request: Request, callback: (data: Fetchable<T>) => void) {
		if (this._isInitialized) {
			return {
				isLoading: false,
				value: this._reqStore.getData(request) as T
			};
		} else {
			this._reqStore.add(request);
			return { isLoading: true };
		}
	}
	protected post<T>(request: Request) : Promise<T> {
		return this.fetchJson<T>('POST', request);
	}
	public processRequests() {
		// TODO: support catching errors and assigning to RequestData
		return Promise
			.all(this._reqStore.requests.map(req => this
				.fetchJson('GET', req)
				.then(value => req.responseData = value)))
			.then(() => this._isInitialized = true);
	}
	public getInitData() {
		return {
			endpoint: this._endpoint,
			requests: this._reqStore.requests
		};
	}
	public hasSessionKey() {
		return this._cookie != null;
	}
}