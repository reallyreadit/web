import * as React from 'react';
import Api from './api/Api';
import contextTypes from './contextTypes';
import PageTitle from './PageTitle';
import User from './User';
import Dialog from './Dialog';

export default class App extends React.Component<{
	api: Api,
	pageTitle: PageTitle,
	user: User
}, {}> {
	static childContextTypes = contextTypes;
	private dialog = new Dialog();
	public getChildContext() {
		return {
			api: this.props.api,
			pageTitle: this.props.pageTitle,
			user: this.props.user,
			dialog: this.dialog
		};
	}
	public render () {
		return React.Children.only(this.props.children);
	}
}