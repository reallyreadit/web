import * as React from 'react';
import * as classnames from 'classnames';

interface Props {
	className?: string;
	children: React.ReactNode;
}

const Pill = ({children, className}: Props) =>
	<div className={ classnames( "pill_m10abw",  className)}>
		{children}
	</div>

export default Pill;