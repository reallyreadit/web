import * as React from 'react';
import TimeZoneSelectListItem from '../../../../../common/models/TimeZoneSelectListItem';
import Fetchable from '../../../serverApi/Fetchable';
import { DateTime } from 'luxon';
import ButtonBar from './ButtonBar';

interface Props {
	onCancel: () => void,
	onGetTimeZones: (callback: (timeZones: Fetchable<TimeZoneSelectListItem[]>) => void) => Fetchable<TimeZoneSelectListItem[]>,
	onStartChallenge: (timeZoneId: number) => void
}
export default class extends React.Component<
	Props,
	{
		isSubmitting: boolean,
		timeZoneSelectListItems: Fetchable<TimeZoneSelectListItem[]>,
		timeZoneSelection: {
			id: number,
			selectListItem: TimeZoneSelectListItem
		} | null
	}
> {
	private readonly _timeZoneName = DateTime.local().zoneName;
	private readonly _selectTimeZone = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectListItem = this.state.timeZoneSelectListItems.value.find(zone => zone.key === e.currentTarget.value);
		this.setState({
			timeZoneSelection: {
				id: (
					selectListItem.value.find(value => value.name === this._timeZoneName) ||
					selectListItem.value[0]
				).id,
				selectListItem
			}
		});
	};
	private readonly _enroll = () => {
		this.setState({ isSubmitting: true });
		this.props.onStartChallenge(this.state.timeZoneSelection.id);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isSubmitting: false,
			timeZoneSelectListItems: props.onGetTimeZones(timeZoneSelectListItems => {
				const selectedListItem = timeZoneSelectListItems.value.find(zone => zone.value.some(value => value.name === this._timeZoneName));
				this.setState({
					timeZoneSelectListItems,
					timeZoneSelection: selectedListItem ? {
							id: selectedListItem.value.find(value => value.name === this._timeZoneName).id,
							selectListItem: selectedListItem
						} :
						null
				});
			}),
			timeZoneSelection: null
		};
	}
	public render() {
		const
			canSelect = (
				!this.state.timeZoneSelectListItems.isLoading &&
				this.state.timeZoneSelectListItems.value
			),
			buttonsEnabled = canSelect && !this.state.isSubmitting;
		return (
			<div className="enroll-screen">
				<span>Select your time zone:</span>
				<select
					{...{ disabled: !canSelect }}
					onChange={this._selectTimeZone}
					value={
						this.state.timeZoneSelection ?
							this.state.timeZoneSelection.selectListItem.key :
							''
					}
				>
					{this.state.timeZoneSelectListItems.isLoading ?
						<option>Loading...</option> :
						this.state.timeZoneSelectListItems.value ?
							this.state.timeZoneSelectListItems.value.map(zone => <option key={zone.key}>{zone.key}</option>) :
							<option>Error loading time zones.</option>}
				</select>
				<ButtonBar isBusy={this.state.isSubmitting}>
					<button
						type="submit"
						onClick={this._enroll}
						disabled={!buttonsEnabled}
					>Looks Good!</button>
					<button
						type="cancel"
						onClick={this.props.onCancel}
						disabled={!buttonsEnabled}
					>Cancel</button>
				</ButtonBar>
			</div>
		);
	}
}