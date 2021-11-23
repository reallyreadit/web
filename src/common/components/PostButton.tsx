import * as React from 'react';
import Popover, { MenuPosition, MenuState } from './Popover';
import Button from './Button';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';
import Link from './Link';

interface Props {
	article: UserArticle,
	menuPosition: MenuPosition,
	onPost: (article: UserArticle) => void,
	stopPropagation?: boolean
}
export default class PostButton extends React.PureComponent<
	Props,
	{ menuState: MenuState }
> {
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
		if (this.state.menuState === MenuState.Opened) {
			this._beginClosingMenu();
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = { menuState: MenuState.Closed };
	}
	public render() {
		if (this.props.article.datesPosted.length) {
			return (
				<Popover
					className="post-button_euo01q"
					menuChildren={
						<div className="content">
							<ol>
								{this.props.article.datesPosted.map(
									date => (
										<li key={date}>Posted on {formatTimestamp(date)}</li>
									)
								)}
							</ol>
							<Link
								text="Post again"
								onClick={this._post}
								// stopPropagation is implied here
								// https://github.com/reallyreadit/web/blob/500a41c5f9fa588e19b15cd85501f3f17a23366d/src/common/components/Popover.tsx#L54
							/>
						</div>
					}
					menuPosition={this.props.menuPosition}
					menuState={this.state.menuState}
					onBeginClosing={this._beginClosingMenu}
					onClose={this._closeMenu}
					onOpen={this._openMenu}
					stopPropagation={this.props.stopPropagation}
				>
					<Button
						intent="success"
						state="set"
						text="Post"
						stopPropagation={this.props.stopPropagation}
					/>
				</Popover>
			);
		}
		return (
			<Button
				className="post-button_euo01q"
				intent="success"
				onClick={this._post}
				text="Post"
				stopPropagation={this.props.stopPropagation}
			/>
		);
	}
}