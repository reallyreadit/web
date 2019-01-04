import * as React from 'react';
import Separator from '../../../../common/components/Separator';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';

export default class extends React.PureComponent<{
	onViewPrivacyPolicy: () => void,
}> {
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	public render() {
		return (
			<div className="footer_ink40x">
				<a href="https://blog.reallyread.it">Blog</a>
				<Separator />
				<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
				<Separator />
				<a
					href={findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()}
					onClick={this._viewPrivacyPolicy}
				>
					Privacy Policy
					</a>
				<br />
				<a href="mailto:support@reallyread.it">support@reallyread.it</a>
			</div>
		);
	}
}