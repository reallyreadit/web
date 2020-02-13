import * as React from 'react';
import Icon from '../../../../../common/components/Icon';
import Button from '../../../../../common/components/Button';
import ActionLink from '../../../../../common/components/ActionLink';

interface Props {
	onRequestAuthorization: () => void,
	onSkip: () => void
}
export default class NotificationsStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="notifications-step_uaqf5m">
				<h1>Stay Connected.</h1>
				<h2>You'll always be in complete control of the types and frequency of notifications you receive.</h2>
				<Icon name="group-circle" />
				<Button
					intent="loud"
					onClick={this.props.onRequestAuthorization}
					size="large"
					text="Enable Notifications"
				/>
				<ActionLink
					onClick={this.props.onSkip}
					text="Maybe Later"
				/>
			</div>
		);
	}
}