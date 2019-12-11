import AnalyticsBase, { PageviewParams, PageviewScreenParams } from '../common/Analytics';
import { findRouteByKey } from '../../common/routing/Route';
import routes from '../../common/routing/routes';

function convertUserIdToString(id: number | null) {
	return id != null ? id.toString() : null;
}
export default class Analytics extends AnalyticsBase {
	private readonly _trackingCode: string;
	private _userIdString: string | null;
	constructor(
		{
			trackingCode,
			userId
		}: {
			trackingCode: string,
			userId: number | null
		}
	) {
		super();
		this._trackingCode = trackingCode;
		this._userIdString = convertUserIdToString(userId);
	}
	private isScreenParams(params: PageviewParams): params is PageviewScreenParams {
		return (params as PageviewScreenParams).key != null;
	}
	public sendSignUp() {
		gtag('event', 'sign_up', { method: 'email' });
	}
	public sendPageview(params: PageviewParams) {
		let
			page_title: string,
			page_path: string;
		if (this.isScreenParams(params)) {
			page_title = findRouteByKey(routes, params.key).analyticsName;
			page_path = params.location.path;
		} else {
			page_title = params.title;
			page_path = params.path;
		}
		gtag(
			'config',
			this._trackingCode,
			{
				page_title,
				page_path,
				user_id: this._userIdString
			}
		);
	}
	public setUserId(id: number | null) {
		this._userIdString = convertUserIdToString(id);
		gtag(
			'config',
			this._trackingCode,
			{
				user_id: convertUserIdToString(id),
				send_page_view: false
			}
		);
	}
}