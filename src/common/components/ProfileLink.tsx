import * as React from 'react';
import ActionLink from './ActionLink';
import classNames, { ClassValue } from 'classnames';

export default class ProfileLink extends React.PureComponent<{
	className?: ClassValue,
	onViewProfile: (userName: string) => void,
	userName: string
}> {
	private readonly _viewProfile = () => {
		this.props.onViewProfile(this.props.userName);
	};
	public render() {
		return (
			<ActionLink
				className={classNames('profile-link_7fs028', this.props.className)}
				onClick={this._viewProfile}
				text={this.props.userName}
			/>
		);
	}
}