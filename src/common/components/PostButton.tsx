import * as React from 'react';
import Popover, { MenuPosition, MenuState } from './Popover';
import Button from './Button';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';

interface Props {
	article: UserArticle,
	onPost: (article: UserArticle) => void,
	popoverEnabled?: boolean
}
export default class PostButton extends React.PureComponent<
	Props,
	{ menuState: MenuState }
> {
	public static defaultProps: Partial<Props> = {
		popoverEnabled: true
	};
	private readonly _beginClosingMenu = () => {
		this.setState({ menuState: MenuState.Closing });
	};
	private readonly _closeMenu = () => {
		this.setState({ menuState: MenuState.Closed });
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: MenuState.Opened });
	};
	private readonly _post = () => {
		this.props.onPost(this.props.article);
	};
	constructor(props: Props) {
		super(props);
		this.state = { menuState: MenuState.Closed };
	}
	public render() {
		if (this.props.article.datePosted) {
			if (this.props.popoverEnabled) {
				return (
					<Popover
						className="post-button_euo01q"
						menuChildren={
							<span className="text">Posted on {formatTimestamp(this.props.article.datePosted)}</span>
						}
						menuPosition={MenuPosition.LeftMiddle}
						menuState={this.state.menuState}
						onBeginClosing={this._beginClosingMenu}
						onClose={this._closeMenu}
						onOpen={this._openMenu}
					>
						<Button
							intent="success"
							state="set"
							text="Post"
						/>
					</Popover>
				);
			} else {
				return (
					<Button
						className="post-button_euo01q"
						intent="success"
						state="set"
						text="Post"
					/>
				);
			}
		}
		return (
			<Button
				className="post-button_euo01q"
				intent="success"
				onClick={this._post}
				text="Post"
			/>
		);
	}
}