import * as React from 'react';
import Icon from './Icon';
import { createQueryString } from '../routing/queryString';
import classNames from 'classnames';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';

interface Props {
	children: React.ReactNode,
	data: ShareData,
	menuPosition: 'left' | 'right',
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onShare: (data: ShareData) => ShareChannel[]
}
export default class ShareControl extends React.PureComponent<
	Props,
	{
		childElementWillReceiveFocus: boolean,
		isMenuClosing: boolean,
		menuOptions: ShareChannel[]
	}
> {
	private readonly _copyLink = () => {
		this.props.onCopyTextToClipboard(
			this.props.data.url,
			'Link copied to clipboard'
		);
		// need to call closeMenu() to handle iOS touch behavior
		this.closeMenu();
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName.startsWith('share-control_mnbspk-pop-out')) {
			this.setState({
				isMenuClosing: false,
				menuOptions: []
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
		if (!this.state.isMenuClosing) {
			if (this.state.menuOptions.length) {
				this.closeMenu();
			} else {
				const shareChannels = this.props.onShare(this.props.data);
				if (shareChannels.length) {
					this.setState({
						menuOptions: shareChannels
					});
				}
			}
		}
	};
	private readonly _openTweetComposer = () => {
		const queryString = createQueryString({
			'text': this.props.data.subject,
			'url': this.props.data.url
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
			isMenuClosing: false,
			menuOptions: []
		};
	}
	private closeMenu() {
		this.setState({
			isMenuClosing: true
		});
	}
	public render() {
		const emailQueryString = createQueryString({
			'body': this.props.data.url,
			'subject': this.props.data.subject
		});
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
				{this.state.menuOptions.length ?
					<div
						className={
							classNames(
								'menu',
								this.props.menuPosition,
								{ 'closing': this.state.isMenuClosing }
							)
						}
						onMouseDown={this._registerImpendingChildFocusTransition}
					>
						{this.state.menuOptions.includes(ShareChannel.Clipboard) ?
							<button
								className="button"
								onClick={this._copyLink}
							>
								<Icon name="link" />
								<label>Copy Link</label>
							</button> :
							null}
						{this.state.menuOptions.includes(ShareChannel.Email) ?
							<a
								className="button"
								href={`mailto:${emailQueryString}`}
								target="_blank"
							>
								<Icon name="paper-plane" />
								<label>Email</label>
							</a> :
							null}
						{this.state.menuOptions.includes(ShareChannel.Twitter) ?
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