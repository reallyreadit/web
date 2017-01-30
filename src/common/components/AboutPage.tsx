import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

export default class AboutPage extends PureContextComponent<{}, {}> {
	public componentWillMount() {
		this.context.pageTitle.set('About Us');
	}
	public render() {
		return (
			<div className="about-page">
				<span>About us!</span>
			</div>
		);
	}
}