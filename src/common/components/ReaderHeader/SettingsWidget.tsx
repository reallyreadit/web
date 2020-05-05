import * as React from 'react';
import Popover, { MenuPosition, MenuState } from '../Popover';
import Icon from '../Icon';
import RadioButtons from '../RadioButtons';

interface Props {
	isHidden: boolean
}
interface State {
	links: 'show' | 'hide',
	menuState: MenuState,
	textSize: 'default' | 'large' | 'xlarge',
	theme: 'light' | 'dark'
}
const
	linkOptions = [
		{
			key: 'Show',
			value: 'show'
		},
		{
			key: 'Hide',
			value: 'hide'
		}
	],
	textSizeOptions = [
		{
			key: 'Default',
			value: 'default'
		},
		{
			key: 'Large',
			value: 'large'
		},
		{
			key: 'X-Large',
			value: 'xlarge'
		}
	],
	themeOptions = [
		{
			key: 'Light',
			value: 'light'
		},
		{
			key: 'Dark',
			value: 'dark'
		}
	];
export default class SettingsWidget extends React.PureComponent<Props, State> {
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
	private readonly _setLinks = (value: string) => {
		this.setState({
			links: value as 'show' | 'hide'
		});
	};
	private readonly _setTextSize = (value: string) => {
		this.setState({
			textSize: value as 'default' | 'large' | 'xlarge'
		});
	};
	private readonly _setTheme = (value: string) => {
		this.setState({
			theme: value as 'light' | 'dark'
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			links: 'hide',
			menuState: MenuState.Closed,
			textSize: 'default',
			theme: 'light'
		};
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.isHidden &&
			!prevProps.isHidden &&
			this.state.menuState === MenuState.Opened
		) {
			this._beginClosingMenu();
		}
	}
	public render() {
		return (
			<div className="settings-widget_eu0rn0 widget">
				<Popover
					menuChildren={
						<div className="widget-menu-content">
							<label>Reader mode settings</label>
							<table>
								<tbody>
									<tr>
										<td colSpan={2}></td>
									</tr>
									<tr>
										<th>Links</th>
										<td>
											<label>Links</label>
											<RadioButtons
												onChange={this._setLinks}
												options={linkOptions}
												value={this.state.links}
											/>
										</td>
									</tr>
									<tr>
										<td colSpan={2}></td>
									</tr>
									<tr>
										<th>Text Size</th>
										<td>
											<label>Text Size</label>
											<RadioButtons
												onChange={this._setTextSize}
												options={textSizeOptions}
												value={this.state.textSize}
											/>
										</td>
									</tr>
									<tr>
										<td colSpan={2}></td>
									</tr>
									<tr>
										<th>Theme</th>
										<td>
											<label>Theme</label>
											<RadioButtons
												onChange={this._setTheme}
												options={themeOptions}
												value={this.state.theme}
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					}
					menuPosition={MenuPosition.BottomRight}
					menuState={this.state.menuState}
					onBeginClosing={this._beginClosingMenu}
					onClose={this._closeMenu}
					onOpen={this._openMenu}
				>
					<Icon
						badge={false}
						display="block"
						name="gear"
					/>
				</Popover>
			</div>
		);
	}
}