import * as React from 'react';
import Popover, { MenuPosition, MenuState } from '../Popover';
import Icon from '../Icon';
import RadioButtons from '../RadioButtons';
import DisplayPreference, { DisplayTheme } from '../../models/userAccounts/DisplayPreference';

interface Props {
	displayPreference: DisplayPreference | null,
	isHidden: boolean,
	onChangeDisplayPreference: (preference: DisplayPreference) => Promise<DisplayPreference>,
}
interface State {
	menuState: MenuState
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
			key: 'M',
			value: '1'
		},
		{
			key: 'L',
			value: '2'
		},
		{
			key: 'XL',
			value: '3'
		}
	],
	themeOptions = [
		{
			key: 'Light',
			value: DisplayTheme.Light.toString()
		},
		{
			key: 'Dark',
			value: DisplayTheme.Dark.toString()
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
		if (!this.props.displayPreference) {
			return;
		}
		this.props.onChangeDisplayPreference({
			...this.props.displayPreference,
			hideLinks: value === 'hide'
		});
	};
	private readonly _setTextSize = (value: string) => {
		if (!this.props.displayPreference) {
			return;
		}
		this.props.onChangeDisplayPreference({
			...this.props.displayPreference,
			textSize: parseInt(value)
		});
	};
	private readonly _setTheme = (value: string) => {
		if (!this.props.displayPreference) {
			return;
		}
		this.props.onChangeDisplayPreference({
			...this.props.displayPreference,
			theme: parseInt(value) as DisplayTheme
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			menuState: MenuState.Closed
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
							<table>
								<tbody>
									<tr>
										<th>Theme</th>
										<td>
											<label>Theme</label>
											<RadioButtons
												onChange={this._setTheme}
												options={themeOptions}
												value={this.props.displayPreference?.theme.toString() ?? ''}
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
												value={this.props.displayPreference?.textSize.toString() ?? ''}
											/>
										</td>
									</tr>
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
												value={
													this.props.displayPreference != null ?
														this.props.displayPreference.hideLinks ?
															'hide' :
															'show' :
														''
												}
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
						name="equalizer"
					/>
				</Popover>
			</div>
		);
	}
}