import Api from './api/Api';
import Page from './Page';
import User from './User';
import { RouterChildContext } from 'react-router';
import Logger from '../../common/Logger';
import * as PropTypes from 'prop-types';
import Environment from './Environment';
import App from './App';
import Extension from './Extension';
import Challenge from './Challenge';

export const contextTypes = {
	api: PropTypes.instanceOf(Api),
	challenge: PropTypes.instanceOf(Challenge),
	environment: PropTypes.instanceOf(Environment),
	log: PropTypes.object,
	page: PropTypes.instanceOf(Page),
	router: PropTypes.object,
	user: PropTypes.instanceOf(User)
};
export default interface Context extends RouterChildContext<{}> {
	api: Api,
	challenge: Challenge,
	environment: Environment<App, Extension>,
	log: Logger,
	page: Page,
	user: User
}