import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PureContextComponent from '../PureContextComponent';

export default class extends PureContextComponent<RouteComponentProps<{}>, {}> {
	public componentWillMount() {
		this.context.page.setState({
			title: 'Admin',
			isLoading: false,
			isReloadable: false
		});
	}
	public render() {
		return (
			<div className="admin-page">
				<p>
					<strong>Adminz0r!</strong>
				</p>
			</div>
		);
	}
}