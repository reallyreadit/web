import Request from './Request';
import RequestData from './RequestData';

export default class RequestStore {
	public readonly requests: Request[];
	constructor(requestData: RequestData[] = []) {
		this.requests = requestData.map(data => new Request(data.path, data.query, data.responseData));
	}
	public get(request: Request) {
		return this.requests.filter(request => request.equals(request))[0];
	}
	public getData(request: Request) {
		return this.get(request).responseData;
	}
	public add(request: Request) {
		if (this.get(request) === undefined) {
			this.requests.push(request);
		}
	}
}