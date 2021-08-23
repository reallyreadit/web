import * as React from 'react';
import classNames from 'classnames';
import AlertBadge from '../../../common/components/AlertBadge';

export interface Item {
	badge?: number,
	value: string
}
interface Props {
	disabled?: boolean,
	items: Item[],
	onChange: (value: string) => void,
	style?: 'auto' | 'compact' | 'extended'
	value: string
}
export default class HeaderSelector extends React.Component<Props> {
	public static defaultProps: Pick<Props, 'style'> = {
		style: 'auto'
	};
	private readonly _change = (event: React.MouseEvent<HTMLButtonElement>) => {
		this.props.onChange(event.currentTarget.value);
	};
	public render() {
		return (
			<div className={classNames('header-selector_9li9z5', this.props.style)}>
				{this.props.items.map(
					item => (
						<button
							className={classNames({ 'selected': this.props.value === item.value })}
							disabled={this.props.disabled}
							key={item.value}
							onClick={this._change}
							value={item.value}
						>
							{item.value}
							<AlertBadge count={item.badge} />
						</button>
					)
				)}
			</div>
		);
	}
}