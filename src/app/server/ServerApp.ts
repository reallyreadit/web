import App from '../common/App';
import UserArticle from '../../common/models/UserArticle';

export default class extends App {
	public readArticle(article: UserArticle) {
		throw new Error('Operation not supported in server environment');
	}
}