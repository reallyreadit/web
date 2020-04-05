import * as React from 'react';
import Separator from '../../../../common/components/Separator';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import StoreLinks from '../StoreLinks';

export default class extends React.PureComponent<{
	onViewBlog: () => void,
	onViewPrivacyPolicy: () => void
}> {
	private readonly _viewBlog = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewBlog();
	};
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	public render() {
		return (
			<div
				className="footer_ink40x"
				data-nosnippet	
			>
				<div className="links">
					<a
						href={findRouteByKey(routes, ScreenKey.Blog).createUrl()}
						onClick={this._viewBlog}
					>
						Blog
					</a>
					<Separator />
					<a
						href={findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()}
						onClick={this._viewPrivacyPolicy}
					>
						Terms of Service
					</a>
					<Separator />
					<a href="mailto:support@readup.com">support@readup.com</a>
				</div>
				<StoreLinks />
			</div>
		);
	}
}