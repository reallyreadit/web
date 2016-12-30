import * as React from 'react';
import Api from './api/Api';
import PageTitle from './PageTitle';
import User from './User';
import Dialog from './Dialog';

export default {
	api: React.PropTypes.instanceOf(Api),
	pageTitle: React.PropTypes.instanceOf(PageTitle),
	user: React.PropTypes.instanceOf(User),
	dialog: React.PropTypes.instanceOf(Dialog),
	router: React.PropTypes.object
};