export type Method = 'GET' | 'POST';

export default class Request {
	private readonly _id: string | number;
	private readonly _method: Method;
	private readonly _path: string;
	private readonly _data: { [key: string]: any };
	constructor(method: Method, path: string, data?: {});
	constructor(id: string | number, method: Method, path: string, data?: {});
	constructor(arg0: string | number | Method, arg1: string | Method, arg2: string | {}, arg3?: {}) {
		if (typeof arg2 === 'string') {
			this._id = arg0;
			this._method = arg1 as Method;
			this._path = arg2;
			this._data = arg3;
		} else {
			this._method = arg0 as Method;
			this._path = arg1;
			this._data = arg2;
		}
	}
	public getQueryString() {
		// TODO: support nested objects and arrays
		if (this._data) {
			const kvps = Object.keys(this._data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(this._data[key]));
			if (kvps.length) {
				return '?' + kvps.join('&');
			}
		}
		return '';
	}
	public get id() {
		return this._id;
	}
	public get method() {
		return this._method;
	}
	public get path() {
		return this._path;
	}
	public get data() {
		return this._data;
	}
}