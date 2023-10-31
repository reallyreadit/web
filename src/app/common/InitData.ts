// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import AppReferral from './AppReferral';
import { DeviceType } from '../../common/DeviceType';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import { AppPlatform } from '../../common/AppPlatform';

type CommonInitData = {
	apiServerEndpoint: HttpEndpoint;
	deviceType: DeviceType;
	exchanges: Exchange[];
	initialLocation: RouteLocation;
	initialShowTrackingAnimationPrompt: boolean,
	staticServerEndpoint: HttpEndpoint;
	userProfile: WebAppUserProfile | null;
	version: string;
	webServerEndpoint: HttpEndpoint;
};
type AppInitData = CommonInitData & {
	appReferral: AppReferral;
	appPlatform: AppPlatform;
	clientType: ClientType.App;
};
type BrowserInitData = CommonInitData & {
	clientType: ClientType.Browser;
	extensionVersion: string | null;
};
type InitData = AppInitData | BrowserInitData;
export default InitData;
