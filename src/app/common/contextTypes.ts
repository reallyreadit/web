import * as React from 'react';
import Api from './api/Api';
import Page from './Page';
import User from './User';
import Extension from './Extension';

export default {
	api: React.PropTypes.instanceOf(Api),
	page: React.PropTypes.instanceOf(Page),
	user: React.PropTypes.instanceOf(User),
	router: React.PropTypes.object,
	extension: React.PropTypes.instanceOf(Extension),
	environment: React.PropTypes.string
};