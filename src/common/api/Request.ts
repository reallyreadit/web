export default class Request {
	constructor(
		public readonly path: string,
		public readonly query: {} = undefined,
		public responseData: {} = undefined
	) {
	}
	public equals(request: Request) {
		if (request.path !== this.path) {
			return false;
		}
		if (request.query === undefined || this.query === undefined) {
			return request.query === undefined && this.query === undefined;
		}
		if (Object.keys(request.query).length !== Object.keys(this.query).length) {
			return false;
		}
		for (let key in request.query) {
			if (!this.query.hasOwnProperty(key) || (<any>request.query)[key] !== (<any>this.query)[key]) {
				return false;
			}
		}
		return true;
	}
}