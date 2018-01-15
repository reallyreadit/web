import * as React from 'react';

export default (props: React.Props<{}>) =>
	<ul className="article-list">
		{props.children}
	</ul>