import * as PropTypes from 'prop-types';
import Api from './api/Api';
import Page from './Page';
import User from './User';
import Extension from './Extension';


export default {
	api: PropTypes.instanceOf(Api),
	page: PropTypes.instanceOf(Page),
	user: PropTypes.instanceOf(User),
	router: PropTypes.object,
	extension: PropTypes.instanceOf(Extension),
	environment: PropTypes.string
};