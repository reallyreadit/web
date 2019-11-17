import * as React from 'react';
import Popover, { MenuPosition, MenuState } from './Popover';
import Icon from './Icon';
import { formatTimestamp } from '../format';

interface Props {
	timestamp: string
}
export default class AotdPopover extends React.PureComponent<
	Props,
	{
		menuState: MenuState
	}
> {
	private readonly _beginClosingMenu = () => {
		this.setState({
			menuState: MenuState.Closing
		});
	};
	private readonly _closeMenu = () => {
		this.setState({
			menuState: MenuState.Closed
		});
	};
	private readonly _openMenu = () => {
		this.setState({
			menuState: MenuState.Opened
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			menuState: MenuState.Closed
		};
	}
	public render() {
		return (
			<Popover
				className="aotd-popover_cgfd5c"
				menuChildren={
					<div className="content">
						AOTD on {formatTimestamp(this.props.timestamp)}
					</div>
				}
				menuPosition={MenuPosition.LeftMiddle}
				menuState={this.state.menuState}
				onBeginClosing={this._beginClosingMenu}
				onClose={this._closeMenu}
				onOpen={this._openMenu}
			>
				<Icon
					display="block"
					name="trophy"
				/>
			</Popover>
		);
	}
}