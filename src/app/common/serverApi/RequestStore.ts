import Request, { areEqual } from './Request';
import Exchange from './Exchange';

export default class RequestStore {
	private readonly _exchanges: Exchange[];
	constructor(exchanges: Exchange[] = []) {
		this._exchanges = exchanges;
	}
	public getExchange(request: Request) {
		return this.exchanges.find(exchange => areEqual(exchange.request, request));
	}
	public addRequest(request: Request) {
		if (!this.getExchange(request)) {
			this.exchanges.push({ request });
		}
	}
	public get exchanges() {
		return this._exchanges;
	}
}