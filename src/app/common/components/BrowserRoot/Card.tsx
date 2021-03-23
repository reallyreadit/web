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
		className={classNames('card_d4pcqo', props.className)}
		data-nosnippet={props.noGoogleSnippet ? '' : null}
	>
        {props.children}
	</div>
);