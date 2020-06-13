import * as React from 'react';
import ActionLink from './ActionLink';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

const profileRoute = findRouteByKey(routes, ScreenKey.Author);
export default class AuthorLink extends React.PureComponent<{
	className?: ClassValue,
	onCreateAbsoluteUrl: (path: string) => string,
	onViewAuthor: (slug: string, name: string) => void,
	name: string,
	slug: string
}> {
	private readonly _viewAuthor = (event: React.MouseEvent<HTMLElement>) => {
		event.preventDefault();
		this.props.onViewAuthor(this.props.slug, this.props.name);
	};
	public render() {
		return (
			<ActionLink
				className={classNames('author-link_34t3vc', this.props.className)}
				href={this.props.onCreateAbsoluteUrl(
					profileRoute.createUrl({ 'slug': this.props.slug })
				)}
				onClick={this._viewAuthor}
				text={this.props.name}
			/>
		);
	}
}