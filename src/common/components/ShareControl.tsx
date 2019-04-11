import * as React from 'react';
import Icon from './Icon';
import { createQueryString } from '../routing/queryString';
import classNames from 'classnames';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import { truncateText } from '../format';

export enum MenuPosition {
	BottomLeft = 'bottom,left',
	CenterTop = 'center,top',
	MiddleLeft = 'middle,left',
	MiddleRight = 'middle,right'
}
interface Props {
	children: React.ReactNode,
	menuPosition: MenuPosition,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onGetData: () => ShareData,
	onShare: (data: ShareData) => ShareChannel[]
}
export default class ShareControl extends React.PureComponent<
	Props,
	{
		childElementWillReceiveFocus: boolean,
		data: ShareData | null,
		isMenuClosing: boolean,
		shareChannels: ShareChannel[]
	}
> {
	private readonly _copyLink = () => {
		this.props.onCopyTextToClipboard(
			this.props.onGetData().url,
			'Link copied to clipboard'
		);
		// need to call closeMenu() to handle iOS touch behavior
		this.closeMenu();
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName.startsWith('share-control_mnbspk-pop-out')) {
			this.setState({
				data: null,
				isMenuClosing: false,
				shareChannels: []
			});
		}
	};
	private readonly _handleBlur = () => {
		if (!this.state.childElementWillReceiveFocus) {
			this.closeMenu();
		} else {
			this.setState({ childElementWillReceiveFocus: false });
		}
	};
	private readonly _handleChildrenClick = () => {
		if (this.state.shareChannels.length) {
			this.closeMenu();
		} else {
			const
				data = this.props.onGetData(),
				shareChannels = this.props.onShare(data);
			if (shareChannels.length) {
				this.setState({
					data,
					shareChannels
				});
			}
		}
	};
	private readonly _openTweetComposer = () => {
		const queryString = createQueryString({
			'text': truncateText(this.state.data.text, 280 - 25),
			'url': this.state.data.url
		});
		window.open(
			`https://twitter.com/intent/tweet${queryString}`,
			'',
			'height=300,location=0,menubar=0,toolbar=0,width=500'
		);
	};
	private readonly _registerImpendingChildFocusTransition = () => {
		this.setState({ childElementWillReceiveFocus: true });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			childElementWillReceiveFocus: false,
			data: null,
			isMenuClosing: false,
			shareChannels: []
		};
	}
	private closeMenu() {
		this.setState({
			isMenuClosing: true
		});
	}
	public render() {
		return (
			<div
				className="share-control_mnbspk"
				onAnimationEnd={this._handleAnimationEnd}
				onBlur={this._handleBlur}
				tabIndex={-1}
			>
				<div
					className="children"
					onClick={this._handleChildrenClick}
				>
					{this.props.children}
				</div>
				{this.state.shareChannels.length ?
					<div
						className={
							classNames(
								'menu',
								this.props.menuPosition.split(','),
								{ 'closing': this.state.isMenuClosing }
							)
						}
						onMouseDown={this._registerImpendingChildFocusTransition}
					>
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
					</div> :
					null}
			</div>
		);
	}
}