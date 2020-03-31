import ComponentHost, { DomAttachmentDelegate } from './ComponentHost';
import BrowserHeader, { Props as BrowserHeaderProps } from './components/BrowserHeader';
import UserArticle from '../../../common/models/UserArticle';

type Services = Pick<BrowserHeaderProps, 'onCreateAbsoluteUrl' | 'onSetStarred' | 'onToggleDebugMode' | 'onViewComments' | 'onViewProfile'>;
type State = Pick<BrowserHeaderProps, 'article' | 'authors' | 'isStarred' | 'isStarring' | 'title' | 'wordCount'>;
export default class HeaderComponentHost extends ComponentHost<Services, State> {
	private _animationTimeout: number | null;
	protected readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Pick<Services, Exclude<keyof Services, 'onSetStarred'>> & {
				onSetStarred: (isStarred: boolean) => Promise<UserArticle>
			}
		}
	) {
		super(params);
		this._component = BrowserHeader;
		this._services = {
			...params.services,
			onSetStarred: isStarred => params.services
				.onSetStarred(isStarred)
				.then(
					article => {
						this.articleUpdated(article);
					}
				)
		};
	}
	public articleUpdated(article: UserArticle) {
		this.setState({
			article: {
				isLoading: false,
				value: article
			},
			authors: article.authors,
			isStarred: !!article.dateStarred,
			title: article.title,
			wordCount: article.wordCount
		});
	}
	public deinitialize() {
		if (this._animationTimeout != null) {
			window.clearTimeout(this._animationTimeout);
			this._animationTimeout = null;
		}
		this.setState({
			isStarring: false,
			isStarred: false
		});
	}
	public initialize(
		{
			animationDuration,
			authors,
			title,
			wordCount
		} : {
			animationDuration: number,
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
			isStarred: false,
			isStarring: true,
			title,
			wordCount
		});
		this._animationTimeout = window.setTimeout(
			() => {
				this.setState({
					isStarred: true,
					isStarring: false
				});
			},
			animationDuration
		);
		return this;
	}
}