import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue,
		id?: string
		noGoogleSnippet?: boolean
	}
) => (
	<div
		className={classNames('home-panel_w65z7c', props.className)}
		id={props.id != null ? props.id : null}
		data-nosnippet={props.noGoogleSnippet ? '' : null}
	>
		<div className="content">
			{props.children}
		</div>
	</div>
);