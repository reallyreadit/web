import * as React from 'react';
import Api from './api/Api';
import contextTypes from './contextTypes';
import Page from './Page';
import User from './User';
import Dialog from './Dialog';
import Extension from './Extension';

export default class App extends React.Component<{
	api: Api,
	page: Page,
	user: User,
	extension: Extension,
	environment: 'server' | 'browser'
}, {}> {
	public static childContextTypes = contextTypes;
	private dialog = new Dialog();
	public getChildContext() {
		return {
			api: this.props.api,
			page: this.props.page,
			user: this.props.user,
			dialog: this.dialog,
			extension: this.props.extension,
			environment: this.props.environment
		};
	}
	public render () {
		return React.Children.only(this.props.children);
	}
}