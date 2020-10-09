import { DomAttachmentDelegate } from '../../../common/shadowDom/ComponentHost';
import ReaderHeader, { Props as HeaderProps } from '../../../common/components/ReaderHeader';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';
import UserArticle from '../../../common/models/UserArticle';
import DisplayPreference from '../../../common/models/userAccounts/DisplayPreference';
import ExtensionComponentHost from './ExtensionComponentHost';

interface Services {
	onChangeDisplayPreference: (preference: DisplayPreference) => Promise<DisplayPreference>,
	onReportArticleIssue: (request: ArticleIssueReportRequest) => void
}
type State = Pick<HeaderProps, 'article' | 'displayPreference' | 'isHidden' | 'showProgressBar'>;
export default class HeaderComponentHost extends ExtensionComponentHost<Services, State> {
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
		if (!this._state) {
			this.initialize(null);
		}
		this.setState({
			article: {
				isLoading: false,
				value: article
			}
		});
	}
	public displayPreferenceUpdated(preference: DisplayPreference) {
		if (this._state) {
			this.setState({
				displayPreference: preference
			});
		} else {
			this.initialize(preference);
		}
	}
	public initialize(preference: DisplayPreference | null) {
		this.setState({
			article: {
				isLoading: true
			},
			displayPreference: (
				this._state?.displayPreference != null && preference == null ?
					this._state.displayPreference :
					preference
			),
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