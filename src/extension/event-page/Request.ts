export default interface Request {
	data?: { [key: string]: any };
	id?: number;
	method: 'GET' | 'POST';
	path: string;
}
