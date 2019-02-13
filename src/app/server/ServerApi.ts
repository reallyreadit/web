import * as request from 'request';
import Fetchable from '../../common/Fetchable';
import Request from '../common/serverApi/Request';
import RequestStore from '../common/serverApi/RequestStore';
import HttpEndpoint, { createUrl } from '../../common/HttpEndpoint';
import KeyValuePair from '../../common/KeyValuePair';
import ServerApi from '../common/serverApi/ServerApi';

export default class extends ServerApi {
	private _authCookie: KeyValuePair<string, string | null>;
	constructor(endpoint: HttpEndpoint, authCookie: KeyValuePair<string, string | null>) {
		super(endpoint);
		this._authCookie = authCookie;
		this._reqStore = new RequestStore();
	}
	public fetchJson<T>(method: 'GET' | 'POST', params: Request) {
		return new Promise<T>((resolve, reject) => {
			let url = createUrl(this._endpoint, params.path);
			if (method === 'GET') {
				url += params.getQueryString();
			}
			const options: (request.UriOptions & request.CoreOptions) | (request.UrlOptions & request.CoreOptions) = {
				method,
				uri: url,
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
			};
			if (this.hasAuthCookie()) {
				options.headers = { 'Cookie': this._authCookie.key + '=' + this._authCookie.value };
			}
			if (method === 'POST') {
				options.body = params.query;
			}
			return request(options);
		});
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
	public hasAuthCookie() {
		return !!this._authCookie.value;
	}
}