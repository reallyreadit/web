import * as React from 'react';
import ActionLink from './ActionLink';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

const profileRoute = findRouteByKey(routes, ScreenKey.Profile);
export default class ProfileLink extends React.PureComponent<{
	className?: ClassValue,
	onCreateAbsoluteUrl: (path: string) => string,
	onViewProfile: (userName: string) => void,
	userName: string
}> {
	private readonly _viewProfile = (event: React.MouseEvent<HTMLElement>) => {
		event.preventDefault();
		this.props.onViewProfile(this.props.userName);
	};
	public render() {
		return (
			<ActionLink
				className={classNames('profile-link_7fs028', this.props.className)}
				href={this.props.onCreateAbsoluteUrl(
					profileRoute.createUrl({ 'userName': this.props.userName })
				)}
				onClick={this._viewProfile}
				text={this.props.userName}
			/>
		);
	}
}