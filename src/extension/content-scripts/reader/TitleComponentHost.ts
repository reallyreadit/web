import { DomAttachmentDelegate } from '../../../common/shadowDom/ComponentHost';
import Title, { Props as TitleProps } from './components/Title';
import UserArticle from '../../../common/models/UserArticle';
import ExtensionComponentHost from './ExtensionComponentHost';

type Services = Pick<TitleProps, 'onCreateAbsoluteUrl' | 'onSetStarred' | 'onToggleDebugMode' | 'onViewComments' | 'onViewProfile'>;
type State = Pick<TitleProps, 'article' | 'authors' | 'title' | 'wordCount'>;
export default class TitleComponentHost extends ExtensionComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Services
		}
	) {
		super(params);
		this._component = Title;
		this._services = params.services;
	}
	public articleUpdated(article: UserArticle) {
		this.setState({
			article: {
				isLoading: false,
				value: article
			},
			authors: article.articleAuthors.map(
				author => author.name
			),
			title: article.title,
			wordCount: article.wordCount
		});
	}
	public initialize(
		{
			authors,
			title,
			wordCount
		} : {
			authors: string[],
			title: string,
			wordCount: number
		}
	) {
		this.setState({
			article: {
				isLoading: true
			},
			authors,
			title,
			wordCount
		});
		return this;
	}
}