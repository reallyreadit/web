// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import icons from '../../../common/svg/icons';
import InitData from '../InitData';
import { TwitterCard, TwitterCardType } from '../../server/TwitterCard';
import { DisplayTheme } from '../../../common/models/userAccounts/DisplayPreference';
import HttpEndpoint, { createUrl } from '../../../common/HttpEndpoint';
import { ScreenTitle } from '../../../common/ScreenTitle';

function escapeQuotes(value: string) {
	return value.replace(/"/g, '&quot;');
}
export default ({
	chromeExtensionId,
	content,
	initData,
	noIndex,
	staticServer,
	title,
	twitterCard,
	version,
}: {
	chromeExtensionId: string;
	content: string;
	initData: InitData;
	noIndex: boolean;
	staticServer: HttpEndpoint;
	title: ScreenTitle | null;
	twitterCard: TwitterCard | null;
	version: string;
}) => {
	let themeAttribute = 'data-com_readup_theme';
	if (initData.userProfile?.displayPreference) {
		switch (initData.userProfile.displayPreference.theme) {
			case DisplayTheme.Dark:
				themeAttribute += '="dark"';
				break;
			case DisplayTheme.Light:
				themeAttribute += '="light"';
				break;
		}
	}

	let twitterCardMarkup: string;
	switch (twitterCard?.type) {
		case TwitterCardType.App:
			twitterCardMarkup = `<meta name="twitter:card" content="app" />
		<meta name="twitter:site" content="@ReadupDotCom" />
		<meta name="twitter:app:id:iphone" content="1441825432" />
		<meta name="twitter:app:id:ipad" content="1441825432" />`;
			break;
		case TwitterCardType.Summary:
			if (twitterCard.imageUrl) {
				twitterCardMarkup = `<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@ReadupDotCom" />
		<meta name="twitter:title" content="${escapeQuotes(twitterCard.title)}" />
		<meta name="twitter:description" content="${escapeQuotes(
			twitterCard.description
		)}" />
		<meta name="twitter:image" content="${escapeQuotes(
			twitterCard.imageUrl
		)}" />`;
			} else {
				twitterCardMarkup = `<meta name="twitter:card" content="summary" />
		<meta name="twitter:site" content="@ReadupDotCom" />
		<meta name="twitter:title" content="${escapeQuotes(twitterCard.title)}" />
		<meta name="twitter:description" content="${escapeQuotes(
			twitterCard.description
		)}" />`;
			}
			break;
	}
	return `<!DOCTYPE html>
<html lang="en" data-client-type="${initData.clientType}" ${themeAttribute}>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover" />
		<meta name="google-site-verification" content="9getaJHrSnp0LPyHlFeOT5cJ7fPK-EchoUkPRcAo8S0" />
		${noIndex ? '<meta name="robots" content="noindex" />' : ''}
		${twitterCardMarkup || ''}
		<link rel="icon" type="image/x-icon" href="${createUrl(
			staticServer,
			'/app/images/favicon.ico'
		)}" />
		<link rel="stylesheet" type="text/css" href="${createUrl(
			staticServer,
			`/app/bundles/bundle-${version}.css`
		)}" />
		<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/${chromeExtensionId}">
		<title>${title?.seo ?? title?.default}</title>
	</head>
	<body>
		${icons}
		<div id="root">${content}</div>
		<script type="text/javascript">
			//<!--
			window.reallyreadit = {
				app: {
					initData: ${JSON.stringify(initData)}
				}
			};
			//-->
		</script>
		<script type="text/javascript" src="${createUrl(
			staticServer,
			`/app/bundles/bundle-${version}.js`
		)}"></script>
	</body>
</html>`;
};
