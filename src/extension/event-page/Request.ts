export type Method = 'GET' | 'POST';

export default class Request {
	private readonly _id: number;
	private readonly _method: Method;
	private readonly _path: string;
	private readonly _data: { [key: string]: any };
	constructor(method: Method, path: string, data?: {}, id?: number) {
		this._method = method;
		this._path = path;
		this._data = data;
		this._id = id;
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