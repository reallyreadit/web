import App from '../common/App';

export default class extends App {
	public readArticle(url: string) {
		throw new Error('Operation not supported in server environment');
	}
}