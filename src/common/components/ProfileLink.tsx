import * as React from 'react';
import Link from './Link';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

const profileRoute = findRouteByKey(routes, ScreenKey.Profile);
export default class ProfileLink extends React.Component<{
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
			<Link
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