import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue,
		noGoogleSnippet?: boolean
	}
) => (
	<div
		className={classNames('panel_zd0n2d', props.className)}
		data-nosnippet={props.noGoogleSnippet ? '' : null}
	>
		<div className="content">
			{props.children}
		</div>
	</div>
);