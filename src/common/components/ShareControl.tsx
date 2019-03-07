import * as React from 'react';
import Icon from './Icon';
import { createQueryString } from '../routing/queryString';
import classNames from 'classnames';

enum MenuState {
	Open = 'Open',
	Closing = 'Closing',
	Closed = 'Closed'
}
interface Props {
	children: React.ReactNode,
	menuPosition: 'left' | 'right',
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	subject: string,
	url: string
}
export default class ShareControl extends React.PureComponent<
	Props,
	{
		childElementWillReceiveFocus: boolean,
		menuState: MenuState
	}
> {
	private readonly _copyLink = () => {
		this.props.onCopyTextToClipboard(
			this.props.url,
			'Link copied to clipboard'
		);
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName.startsWith('share-control_mnbspk-pop-out')) {
			this.setState({ menuState: MenuState.Closed });
		}
	};
	private readonly _handleBlur = () => {
		if (!this.state.childElementWillReceiveFocus) {
			this.closeMenu();
		} else {
			this.setState({ childElementWillReceiveFocus: false });
		}
	};
	private readonly _handleIconClick = () => {
		switch (this.state.menuState) {
			case MenuState.Closed:
				this.setState({ menuState: MenuState.Open });
				break;
			case MenuState.Open:
				this.closeMenu();
				break;
		}
	};
	private readonly _openTweetComposer = () => {
		const queryString = createQueryString({
			'text': this.props.subject,
			'url': this.props.url
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
			menuState: MenuState.Closed
		};
	}
	private closeMenu() {
		this.setState({ menuState: MenuState.Closing });
	}
	public render() {
		const emailQueryString = createQueryString({
			'body': this.props.url,
			'subject': this.props.subject
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
					onClick={this._handleIconClick}
				>
					{this.props.children}
				</div>
				<div
					className={classNames('menu', this.props.menuPosition)}
					data-state={this.state.menuState}
					onMouseDown={this._registerImpendingChildFocusTransition}
				>
					<button
						className="button"
						onClick={this._copyLink}
					>
						<Icon name="link" />
						<label>Copy Link</label>
					</button>
					<a
						className="button"
						href={`mailto:${emailQueryString}`}
						target="_blank"
					>
						<Icon name="paper-plane" />
						<label>Email</label>
					</a>
					<button
						className="button"
						onClick={this._openTweetComposer}
					>
						<Icon name="twitter" />
						<label>Tweet</label>
					</button>
				</div>
			</div>
		);
	}
}