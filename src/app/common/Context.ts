import Api from './api/Api';
import Page from './Page';
import User from './User';
import { RouterChildContext } from 'react-router';
import Extension from './Extension';
import * as bunyan from 'bunyan';
import * as PropTypes from 'prop-types';

export const contextTypes = {
	api: PropTypes.instanceOf(Api),
	environment: PropTypes.string,
	extension: PropTypes.instanceOf(Extension),
	log: PropTypes.instanceOf(bunyan),
	page: PropTypes.instanceOf(Page),
	router: PropTypes.object,
	user: PropTypes.instanceOf(User)
};
export default interface Context extends RouterChildContext<{}> {
	api: Api,
	environment: 'server' | 'browser',
	extension: Extension,
	log: bunyan,
	page: Page,
	user: User
}