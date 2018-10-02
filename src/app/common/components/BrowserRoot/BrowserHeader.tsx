import * as React from 'react';
import logoText from '../../../../common/svg/logoText';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';

interface Props {
	isUserSignedIn: boolean,
	onOpenMenu: () => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	showNewReplyIndicator: boolean
}
export default class extends React.PureComponent<Props> {
	public render() {
		return (
			<header className="browser-header">
				<div
					className="logo-container"
					dangerouslySetInnerHTML={{ __html: logoText }}
				></div>
				<div className="menu-container">
					{this.props.isUserSignedIn ?
						<div className={classNames('menu-icon-container', { 'indicator': this.props.showNewReplyIndicator })}>
							<Icon
								name="three-bars"
								onClick={this.props.onOpenMenu}
							/>
						</div> :
						<>
							<button onClick={this.props.onShowSignInDialog}>
								Log In
							</button>
							<button
								className="loud"
								onClick={this.props.onShowCreateAccountDialog}
							>
								Sign Up
							</button>
						</>}
				</div>
			</header>
		);
	}
}