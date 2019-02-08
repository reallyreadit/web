import * as React from 'react';

interface Props {
	pageNumber: number,
	pageCount: number,
	onChange: (pageNumber: number) => void,
	disabled?: boolean
}
export default class PageSelector extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		disabled: false
	};
	private _updatePageNumber = (e: React.ChangeEvent<HTMLSelectElement>) => this.props.onChange(parseInt(e.currentTarget.value));
	public render() {
		return (
			<div className="page-selector_a8tbpb">
				Page
				<select value={this.props.pageNumber} onChange={this._updatePageNumber} disabled={this.props.disabled}>
					{Array.from(new Array(this.props.pageCount), (x, i) => <option key={i}>{i + 1}</option>)}
				</select>
			</div>
		);
	}
}