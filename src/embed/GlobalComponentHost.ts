// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { DomAttachmentDelegate } from '../common/shadowDom/ComponentHost';
import Global, { Props as GlobalProps } from './components/Global';
import EmbedComponentHost from './EmbedComponentHost';

type Services = Pick<
	GlobalProps,
	| 'captcha'
	| 'clipboardService'
	| 'dialogService'
	| 'onCloseOnboarding'
	| 'onCreateAccount'
	| 'onCreateAuthServiceAccount'
	| 'onRequestPasswordReset'
	| 'onShowToast'
	| 'onSignIn'
	| 'onSignInWithAuthService'
	| 'toasterService'
>;
type State = Pick<
	GlobalProps,
	| 'article'
	| 'dialogs'
	| 'error'
	| 'onboardingAnalyticsAction'
	| 'toasts'
	| 'user'
>;
export default class GlobalComponentHost extends EmbedComponentHost<
	Services,
	State
> {
	protected readonly _component:
		| React.FunctionComponent<GlobalProps>
		| React.ComponentClass<GlobalProps>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(params: {
		domAttachmentDelegate: DomAttachmentDelegate;
		services: Services;
		state: State;
	}) {
		super(params);
		this._component = Global;
		this._services = params.services;
		this.setState(params.state);
	}
}
