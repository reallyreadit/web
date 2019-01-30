import AppApi, { ArticleReference } from '../common/AppApi';

export default class extends AppApi {
	public readArticle(reference: ArticleReference) {
		throw new Error('Operation not supported in server environment');
	}
}