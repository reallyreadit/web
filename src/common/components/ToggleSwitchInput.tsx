import * as React from 'react';
import AsyncTracker from '../AsyncTracker';
import { State as SaveIndicatorState } from './SaveIndicator';
import ToggleSwitchExpandableInput from './ToggleSwitchExpandableInput';
import { ClassValue } from 'classnames/types';
import * as classNames from 'classnames';

interface Props {
	className?: ClassValue,
	isEnabled: boolean,
	onChange?: (value: string, isEnabled: boolean) => void,
	onChangeAsync?: (value: string, isEnabled: boolean) => Promise<any>,
	subtitle?: string,
	title: string,
	value?: string
}
interface State {
	indicator: SaveIndicatorState
}
export default class ToggleSwitchInput extends React.PureComponent<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _toggleEnabled = (isEnabled: boolean) => {
		if (this.props.onChangeAsync) {
			this.setState({
				indicator: SaveIndicatorState.Saving
			});
			this._asyncTracker.addPromise(
				this.props
					.onChangeAsync(this.props.value, isEnabled)
					.then(
						() => {
							this.setState({
								indicator: SaveIndicatorState.Saved
							});
						}
					)
			);
		} else {
			this.props.onChange(this.props.value, isEnabled);
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			indicator: SaveIndicatorState.None
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ToggleSwitchExpandableInput
				className={classNames('toggle-switch-input_hnmxln', this.props.className)}
				isEnabled={this.props.isEnabled}
				onChange={this._toggleEnabled}
				saveIndicator={this.state.indicator}
				subtitle={this.props.subtitle}
				title={this.props.title}
			/>
		);
	}
}