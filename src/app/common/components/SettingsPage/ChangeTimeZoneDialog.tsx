import * as React from 'react';
import FieldsetDialog, { Props as FormDialogProps, State } from '../controls/FieldsetDialog';
import { FetchFunction } from '../../serverApi/ServerApi';
import TimeZoneSelectListItem, { TimeZoneSelectListItemValue } from '../../../../common/models/TimeZoneSelectListItem';
import Fetchable from '../../../../common/Fetchable';
import { DateTime } from 'luxon';
import AsyncTracker from '../../../../common/AsyncTracker';
import SelectList, { SelectListOption } from '../../../../common/components/SelectList';

interface Props {
	currentTimeZoneId: number | null,
	onChangeTimeZone: (id: number, displayName: string) => Promise<void>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>
}
export default class ChangeTimeZoneDialog extends FieldsetDialog<void, Props, Partial<State> & {
	timeZoneSelectListItems: Fetchable<TimeZoneSelectListItem[]>,
	timeZoneSelection: {
		id: number,
		selectListItem: TimeZoneSelectListItem
	} | null
}> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _selectTimeZone = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectListItem = this.state.timeZoneSelectListItems.value.find(zone => zone.key === e.currentTarget.value);
		this.setState({
			timeZoneSelection: {
				id: (
					selectListItem.value.find(value => value.id === this.props.currentTimeZoneId) ||
					selectListItem.value.find(value => value.name === this._timeZoneName) ||
					selectListItem.value[0]
				).id,
				selectListItem
			}
		});
	};
	private readonly _timeZoneName = DateTime.local().zoneName;
	constructor(props: Props & FormDialogProps) {
		super(
			{
				title: 'Change Time Zone',
				submitButtonText: 'Save Changes',
				successMessage: 'Time zone changed'
			},
			props
		);
		this.state = {
			...this.state,
			isLoading: true,
			timeZoneSelection: null,
			timeZoneSelectListItems: props.onGetTimeZones(this._asyncTracker.addCallback(timeZoneSelectListItems => {
				const selectedItem = timeZoneSelectListItems.value
					.reduce(
						(zones, item) => zones.concat(item.value.map(zone => ({ ...zone, key: item.key }))),
						[] as (TimeZoneSelectListItemValue & { key: string })[]
					)
					.filter(
						zone => this.props.currentTimeZoneId != null ?
							zone.id === this.props.currentTimeZoneId :
							zone.name === this._timeZoneName
					)
					.sort((a, b) => {
						if (a.territory > b.territory) {
							return 1;
						}
						if (a.territory < b.territory) {
							return -1;
						}
						return 0;
					})[0];
				this.setState({
					isLoading: false,
					timeZoneSelectListItems,
					timeZoneSelection: selectedItem ? {
							id: this.props.currentTimeZoneId != null ?
								this.props.currentTimeZoneId :
								selectedItem.id,
							selectListItem: timeZoneSelectListItems.value.find(item => item.key === selectedItem.key)
						} :
						null
				});
			}))
		};
	}
	protected renderFields() {
		const canSelect = (
			!this.state.timeZoneSelectListItems.isLoading &&
			this.state.timeZoneSelectListItems.value
		);
		let options: SelectListOption[];
		if (this.state.timeZoneSelectListItems.isLoading) {
			options = [{
				key: 'Loading...'
			}];
		} else if (this.state.timeZoneSelectListItems.value) {
			options = this.state.timeZoneSelectListItems.value.map(
				zone => ({
					key: zone.key
				})
			);
		} else {
			options = [{
				key: 'Error loading time zones.'
			}];
		}
		return (
			<div className="change-time-zone-dialog_gparpx">
				<SelectList
					{...{ disabled: !canSelect }}
					onChange={this._selectTimeZone}
					options={options}
					value={
						this.state.timeZoneSelection ?
							this.state.timeZoneSelection.selectListItem.key :
							''
					}
				/>
			</div>
		);
	}
	protected submitForm() {
		return this.props.onChangeTimeZone(
			this.state.timeZoneSelection.id,
			this.state.timeZoneSelection.selectListItem.key
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
}