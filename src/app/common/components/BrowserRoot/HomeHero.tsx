import * as React from 'react';
import { ClassValue } from 'classnames/types';
import HomePanel from './HomePanel';
import GetStartedButton from './GetStartedButton';

export default (
	props: {
		// children: React.ReactNode,
		className?: ClassValue,
		noGoogleSnippet?: boolean,
		title: string | React.ReactElement,
		description?: string | React.ReactElement,
		actionButton?: React.ReactElement<GetStartedButton>
	}
) => (
<HomePanel className="home-hero_527aw5">
	<h1 className="heading-regular">{props.title}</h1>
	{ props.description && <p className="">{props.description}</p> }
	{ props.actionButton || null }
</HomePanel>
);