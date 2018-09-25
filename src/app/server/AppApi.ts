import AppApi from '../common/AppApi';
import UserArticle from '../../common/models/UserArticle';

export default class extends AppApi {
	public readArticle(article: UserArticle) {
		throw new Error('Operation not supported in server environment');
	}
}