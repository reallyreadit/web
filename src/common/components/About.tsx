import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

export default class About extends PureContextComponent<{}, {}> {
	public componentWillMount() {
		this.context.pageTitle.set('About Us');
	}
	public render() {
		return (
			<div className="about">
				<span>About us!</span>
			</div>
		);
	}
}