import * as React from 'react';
import ContextComponent from '../ContextComponent';

export default class About extends ContextComponent<{}, {}> {
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