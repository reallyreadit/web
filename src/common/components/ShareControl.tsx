import * as React from 'react';
import Icon from './Icon';
import ShareData, { ShareChannelData } from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import { truncateText } from '../format';
import Popover, { MenuPosition, MenuState } from './Popover';
import ShareForm from '../models/analytics/ShareForm';
import ShareResponse from '../sharing/ShareResponse';
import { ShareEvent } from '../sharing/ShareEvent';

export { MenuPosition } from './Popover';
interface Props {
	children: React.ReactNode,
	menuPosition: MenuPosition,
	onComplete?: (form: ShareForm) => void,
	onGetData: () => ShareData,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void
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
	private _shareResponseCompletionHandler: (form: ShareForm) => void | null;
	private readonly _copyLink = () => {
		this.props.onShareViaChannel({
			channel: ShareChannel.Clipboard,
			text: this.props.onGetData().url
		});
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
		this._shareResponseCompletionHandler = null;
	};
	private readonly _openMenu = (event: React.MouseEvent<HTMLElement>) => {
		const
			data = this.props.onGetData(),
			targetRect = event.currentTarget.getBoundingClientRect(),
			response = this.props.onShare({
				...data,
				selection: {
					x: targetRect.x,
					y: targetRect.y,
					width: targetRect.width,
					height: targetRect.height
				}
			});
		if (response.channels.length) {
			this.setState({
				data,
				menuState: MenuState.Opened,
				shareChannels: response.channels
			});
			if (response.completionHandler) {
				this._shareResponseCompletionHandler = response.completionHandler;
			}
		}
	};
	private readonly _openEmailComposer = () => {
		this.props.onShareViaChannel({
			channel: ShareChannel.Email,
			body: this.state.data.email.body,
			subject: this.state.data.email.subject
		});
		this.completeWithActivityType('Email');
	};
	private readonly _openTweetComposer = () => {
		this.props.onShareViaChannel({
			channel: ShareChannel.Twitter,
			text: truncateText(this.state.data.text, 280 - 25),
			url: this.state.data.url,
			hashtags: [
				'ReadOnReadup'
			],
			via: 'ReadupDotCom'
		});
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
		if (this.props.onComplete || this._shareResponseCompletionHandler) {
			const form: ShareForm = {
				id: null,
				action: this.state.data.action,
				activityType,
				completed: null,
				error: null
			};
			if (this.props.onComplete) {
				this.props.onComplete(form);
			}
			if (this._shareResponseCompletionHandler) {
				this._shareResponseCompletionHandler(form);
			}
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
							<button
								className="button"
								onClick={this._openEmailComposer}
							>
								<Icon name="paper-plane" />
								<label>Email</label>
							</button> :
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