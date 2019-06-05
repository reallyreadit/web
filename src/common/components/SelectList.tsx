import * as React from 'react';
import classNames from 'classnames';

type Props = (
	Pick<
		React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>,
		Exclude<
			keyof React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>,
			'children'
		>
	> & {
		options: {
			key: string | number,
			value?: string | number
		}[]
	}
);
export default (props: Props) => (
	<select {...{ className: classNames('select-list_guiajx', props.className), ...props }}>
		{props.options.map(option => (
			<option
				key={option.key}
				value={option.value != null ? option.value : option.key}
			>
				{option.key}
			</option>
		))}	
	</select>
);