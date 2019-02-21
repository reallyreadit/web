export default interface Request {
	context?: string,
	data?: { [key: string]: any },
	id?: number,
	method: 'GET' | 'POST',
	path: string
}