import * as React from 'react';
import Icon from './Icon';
import { createQueryString } from '../routing/queryString';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import { truncateText } from '../format';
import Popover, { MenuPosition, MenuState } from './Popover';
import ShareForm from '../models/analytics/ShareForm';

export { MenuPosition } from './Popover';
interface Props {
	children: React.ReactNode,
	menuPosition: MenuPosition,
	onComplete?: (form: ShareForm) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onGetData: () => ShareData,
	onShare: (data: ShareData) => ShareChannel[]
}
export default class ShareControl extends React.PureComponent<
	Props,
	{
		data: ShareData | null,
		menuState: MenuState,
		shareChannels: ShareChannel[]
	}
	> {
	private readonly _beginClosingMenu = () => {
		this.setState({ menuState: MenuState.Closing });
	};
	private readonly _copyLink = () => {
		this.props.onCopyTextToClipboard(
			this.props.onGetData().url,
			'Link copied to clipboard'
		);
		// need to call closeMenu() to handle iOS touch behavior
		this._beginClosingMenu();
		this.completeWithActivityType('Copy');
	};
	private readonly _closeMenu = () => {
		this.setState({
			data: null,
			menuState: MenuState.Closed,
			shareChannels: []
		});
	};
	private readonly _handleEmailLinkClick = () => {
		this.completeWithActivityType('Email');
	};
	private readonly _openMenu = () => {
		const
			data = this.props.onGetData(),
			shareChannels = this.props.onShare(data);
		if (shareChannels.length) {
			this.setState({
				data,
				menuState: MenuState.Opened,
				shareChannels
			});
		}
	};
	private readonly _openTweetComposer = () => {
		const queryString = createQueryString({
			'text': truncateText(this.state.data.text, 280 - 25),
			'url': this.state.data.url,
			'hashtags': 'ReadOnReadup',
			'via': 'ReadupDotCom'
		});
		window.open(
			`https://twitter.com/intent/tweet${queryString}`,
			'',
			'height=300,location=0,menubar=0,toolbar=0,width=500'
		);
		this.completeWithActivityType('Twitter');
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			data: null,
			menuState: MenuState.Closed,
			shareChannels: []
		};
	}
	private completeWithActivityType(activityType: string) {
		if (this.props.onComplete) {
			this.props.onComplete({
				id: null,
				action: this.state.data.action,
				activityType,
				completed: null,
				error: null
			});
		}
	}
	public render() {
		return (
			<Popover
				className="share-control_mnbspk"
				menuChildren={
					<>
						{this.state.shareChannels.includes(ShareChannel.Clipboard) ?
							<button
								className="button"
								onClick={this._copyLink}
							>
								<Icon name="link" />
								<label>Copy Link</label>
							</button> :
							null}
						{this.state.shareChannels.includes(ShareChannel.Email) ?
							<a
								className="button"
								href={`mailto:${createQueryString({
									'body': this.state.data.email.body,
									'subject': this.state.data.email.subject
								})}`}
								onClick={this._handleEmailLinkClick}
								target="_blank"
							>
								<Icon name="paper-plane" />
								<label>Email</label>
							</a> :
							null}
						{this.state.shareChannels.includes(ShareChannel.Twitter) ?
							<button
								className="button"
								onClick={this._openTweetComposer}
							>
								<Icon name="twitter" />
								<label>Tweet</label>
							</button> :
							null}
					</>
				}
				menuPosition={this.props.menuPosition}
				menuState={this.state.menuState}
				onBeginClosing={this._beginClosingMenu}
				onClose={this._closeMenu}
				onOpen={this._openMenu}
			>
				{this.props.children}
			</Popover>
		);
	}
}