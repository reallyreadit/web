export function areEqual(a: Request, b: Request) {
	if (a.path !== b.path) {
		return false;
	}
	if (!a.data || !b.data) {
		return !a.data && !b.data;
	}
	if (Object.keys(a.data).length !== Object.keys(b.data).length) {
		return false;
	}
	for (let key in a.data) {
		if (!b.data.hasOwnProperty(key) || a.data[key] !== b.data[key]) {
			return false;
		}
	}
	return true;
}
export default interface Request {
	context?: string,
	data?: { [key: string]: any },
	path: string
}