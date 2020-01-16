import ServerApi from '../common/serverApi/ServerApi';
import Request from '../common/serverApi/Request';
import Fetchable from '../../common/Fetchable';
import RequestStore from '../common/serverApi/RequestStore';
import HttpEndpoint, { createUrl } from '../../common/HttpEndpoint';
import { createQueryString } from '../../common/routing/queryString';
import Exchange from '../common/serverApi/Exchange';
import ClientType from '../common/ClientType';

export default class extends ServerApi {
	constructor(
		endpoint: HttpEndpoint,
		clientType: ClientType,
		clientVersion: string,
		exchanges: Exchange[]
	) {
		super(
			endpoint,
			new RequestStore(exchanges),
			clientType,
			clientVersion
		);
	}
	private addCustomHeaders(req: XMLHttpRequest, params: Request) {
		req.setRequestHeader('X-Readup-Client', this.getClientHeaderValue());
	}
	private fetchJson<T>(method: 'GET' | 'POST', params: Request) {
		return new Promise<T>((resolve, reject) => {
			const url = createUrl(this._endpoint, params.path);
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
				req.open(method, url);
				this.addCustomHeaders(req, params);
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(params.data));
			} else {
				req.open(method, url + createQueryString(params.data));
				this.addCustomHeaders(req, params);
				req.send();
			}
		});
	} 
	protected get<T>(request: Request, callback: (data: Fetchable<T>) => void) {
		if (!this._isInitialized) {
			const exchange = this._reqStore.getExchange(request);
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
	public getClientHeaderValue() {
		return `web/app/client#${this._clientType}@${this._clientVersion}`;
	}
	public initialize() : void {
		this._isInitialized = true;
	}
}