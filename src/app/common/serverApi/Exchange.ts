import Request from './Request';

export default interface Exchange {
	request: Request,
	responseData?: any,
	responseErrors?: any,
	processed: boolean
}