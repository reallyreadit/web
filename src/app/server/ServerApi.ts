import * as request from 'request';
import Fetchable from '../../common/Fetchable';
import Request from '../common/serverApi/Request';
import RequestStore from '../common/serverApi/RequestStore';
import HttpEndpoint, { createUrl } from '../../common/HttpEndpoint';
import KeyValuePair from '../../common/KeyValuePair';
import ServerApi from '../common/serverApi/ServerApi';
import { createQueryString } from '../../common/routing/queryString';
import ClientType from '../common/ClientType';
import { DeviceType } from '../../common/DeviceType';

export default class extends ServerApi {
	private _authCookie: KeyValuePair<string, string | null>;
	constructor(
		endpoint: HttpEndpoint,
		clientType: ClientType,
		clientVersion: string,
		deviceType: DeviceType,
		authCookie: KeyValuePair<string, string | null>
	) {
		super(
			endpoint,
			new RequestStore(),
			clientType,
			clientVersion,
			deviceType
		);
		this._authCookie = authCookie;
	}
	public fetchJson<T>(method: 'GET' | 'POST', params: Request) {
		return new Promise<T>((resolve, reject) => {
			let url = createUrl(this._endpoint, params.path);
			if (method === 'GET') {
				url += createQueryString(params.data);
			}
			const options: (request.UriOptions & request.CoreOptions) | (request.UrlOptions & request.CoreOptions) = {
				method,
				uri: url,
				headers: {
					'X-Readup-Client': this.getClientHeaderValue()
				},
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
			if (this.hasAuthCookie() && this.shouldIncludeCredentials) {
				options.headers['Cookie'] = this._authCookie.key + '=' + this._authCookie.value;
			}
			if (method === 'POST') {
				options.body = params.data;
			}
			return request(options);
		});
	}
	public getClientHeaderValue() {
		return `web/app/server#${this._clientType}@${this._clientVersion}`;
	}
	protected get<T>(request: Request, callback: (data: Fetchable<T>) => void) {
		const exchange = this._reqStore.getExchange(request);
		if (exchange?.processed) {
			if (exchange.responseData) {
				return {
					isLoading: false,
					value: exchange.responseData as T
				};
			} else {
				return {
					isLoading: false,
					errors: exchange.responseErrors
				};
			}
		} else if (!exchange) {
			this._reqStore.addRequest(request);
		}
		return { isLoading: true };
	}
	protected post<T>(request: Request) : Promise<T> {
		return this.fetchJson<T>('POST', request);
	}
	public processRequests() {
		return Promise
			.all(
				this._reqStore.exchanges
					.filter(
						exchange => !exchange.processed
					)
					.map(
						exchange => this
							.fetchJson('GET', exchange.request)
							.then(
								value => {
									exchange.responseData = value;
								}
							)
							.catch(
								errors => {
									exchange.responseErrors = errors;
								}
							)
							.finally(
								() => {
									exchange.processed = true;
								}
							)
					)
			);
	}
	public hasAuthCookie() {
		return !!this._authCookie.value;
	}
	public get exchanges() {
		return this._reqStore.exchanges;
	}
}