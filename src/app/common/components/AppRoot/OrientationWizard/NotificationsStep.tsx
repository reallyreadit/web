import * as React from 'react';
import Icon from '../../../../../common/components/Icon';
import Button from '../../../../../common/components/Button';
import Link from '../../../../../common/components/Link';

interface Props {
	onRequestAuthorization: () => void,
	onSkip: () => void
}
export default class NotificationsStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="notifications-step_uaqf5m">
				<h1>Stay connected.</h1>
				<h2>You'll always be in complete control of the types and frequency of notifications you receive.</h2>
				<Icon name="group-circle" />
				<Button
					intent="loud"
					onClick={this.props.onRequestAuthorization}
					size="large"
					text="Enable Notifications"
				/>
				<Link
					onClick={this.props.onSkip}
					text="Maybe Later"
				/>
			</div>
		);
	}
}