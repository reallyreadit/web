import * as http from 'http';
import Api from '../common/api/Api';
import Fetchable from '../common/api/Fetchable';
import Request from '../common/api/Request';
import RequestStore from '../common/api/RequestStore';
import Endpoint from '../common/api/Endpoint';

export default class ServerApi extends Api {
	constructor(endpoint: Endpoint) {
		super(endpoint);
		this.reqStore = new RequestStore();
	}
	public getJson(params: Request) {
		// TODO: append querystring from query object
		return new Promise((resolve, reject) => http.get(this.getUrl(params.path), res => {
				let body = '';
				res.on('data', chunk => body += chunk);
				res.on('end', () => resolve(JSON.parse(body)));
			})
			.on('error', reject));
	}
	protected get<T>(request: Request, callback: (data: Fetchable<T>) => void) {
		if (this.isInitialized) {
			console.log('Api: fetch[sync/value, async/na]');
			return {
				isLoading: false,
				isSuccessful: true,
				value: this.reqStore.getData(request)
			};
		} else {
			console.log('Api: fetch[sync/loading, async/na]');
			this.reqStore.add(request);
			return {
				isLoading: true
			};
		}
	}
	protected post<T>(request: Request) : Promise<T> {
		throw new Error('Cannot POST in server environment');
	}
	public processRequests() {
		// TODO: support catching errors and assigning to RequestData
		return Promise
			.all(this.reqStore.requests.map(req => this
				.getJson(req)
				.then(value => req.responseData = value)))
			.then(() => this.isInitialized = true);
	}
	public getEndpoint() {
		return this.endpoint;
	}
	public getInitData() {
		return this.reqStore.requests;
	}
}