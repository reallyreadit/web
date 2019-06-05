import * as React from 'react';
import SelectList from '../../../../common/components/SelectList';

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
			<form
				autoComplete="off"
				className="page-selector_a8tbpb"
			>
				Page
				<SelectList
					disabled={this.props.disabled}
					onChange={this._updatePageNumber}
					options={
						Array.from(new Array(this.props.pageCount), (x, i) => ({ key: i + 1 }))
					}
					value={this.props.pageNumber}
				/>
			</form>
		);
	}
}