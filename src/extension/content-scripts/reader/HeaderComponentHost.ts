import ComponentHost, { DomAttachmentDelegate } from './ComponentHost';
import ReaderHeader, { Props as HeaderProps } from '../../../common/components/ReaderHeader';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';
import UserArticle from '../../../common/models/UserArticle';

interface Services {
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void
}
type State = Pick<HeaderProps, 'article' | 'isHidden' | 'showProgressBar'>;
export default class HeaderComponentHost extends ComponentHost<Services, State> {
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
		this._component = ReaderHeader;
		this._services = params.services;
	}
	public articleUpdated(article: UserArticle) {
		this.setState({
			article: {
				isLoading: false,
				value: article
			}
		});
	}
	public initialize() {
		this.setState({
			article: {
				isLoading: true
			},
			isHidden: false,
			showProgressBar: false
		});
		return this;
	}
	public setVisibility(isVisible: boolean) {
		if (!this._state || this._state.isHidden !== isVisible) {
			return;
		}
		this.setState({
			isHidden: !isVisible
		});
	}
}