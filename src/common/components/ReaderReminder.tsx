import * as React from 'react';
import Link from './Link';
import InfoBox from './InfoBox';
import * as classNames from 'classnames';

interface Props {
	isActive: boolean,
	onSignIn: () => void,
	onDismiss: (disableReminder: boolean) => void
}

interface State {
	disableReminder: boolean
}

export default class ReaderReminder extends React.Component<Props, State> {
	private readonly _dismiss = () => {
		this.props.onDismiss(this.state.disableReminder);
	};
	private readonly _toggleDisableReminder = () => {
		this.setState(
			prevState => {
				return {
					disableReminder: !prevState.disableReminder
				};
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			disableReminder: false
		};
	}
	public render() {
		return (
			<InfoBox className={classNames('reader-reminder_rg6ejc', { 'hidden': !this.props.isActive })} style="normal">
				<p><span className="logo"></span></p>
				<p>If you want to track your reading history and comment on Readup you need to <Link onClick={this.props.onSignIn}>sign in</Link> before reading the article.</p>
				<p><Link onClick={this._dismiss}>Dismiss</Link></p>
				<p>
					<label><input type="checkbox" checked={this.state.disableReminder} onChange={this._toggleDisableReminder} /> Don't remind me again.</label>
				</p>
			</InfoBox>
		);
	}
}
