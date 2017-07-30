import * as React from 'react';

export default class PageSelector extends React.PureComponent<{
	pageNumber: number,
	pageCount: number,
	onChange: (pageNumber: number) => void,
	disabled: boolean
}, {}> {
	private _updatePageNumber = (e: React.ChangeEvent<HTMLSelectElement>) => this.props.onChange(parseInt(e.currentTarget.value));
	public render() {
		return (
			<div className="page-selector">
				Page
				<select value={this.props.pageNumber} onChange={this._updatePageNumber} disabled={this.props.disabled}>
					{Array.from(new Array(this.props.pageCount), (x, i) => <option key={i}>{i + 1}</option>)}
				</select>
			</div>
		);
	}
}