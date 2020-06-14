import icons from '../../../common/svg/icons';
import InitData from '../InitData';
import { TwitterCard, TwitterCardType } from '../../server/TwitterCard';

function escapeQuotes(value: string) {
	return value.replace(/"/g, '&quot;');
}
export default (
	{
		chromeExtensionId,
		content,
		initData,
		noIndex,
		title,
		twitterCard
	}: {
		chromeExtensionId: string,
		content: string,
		initData: InitData,
		noIndex: boolean,
		title: string,
		twitterCard: TwitterCard | null
	}
) => {
	let gtagConfig: {
		send_page_view: boolean,
		user_id?: string
	} = {
		send_page_view: false
	};
	if (initData.userAccount) {
		gtagConfig.user_id = initData.userAccount.id.toString();
	}
	let twitterCardMarkup: string;
	switch (twitterCard?.type) {
		case TwitterCardType.App:
			twitterCardMarkup = (
		`<meta name="twitter:card" content="app" />
		<meta name="twitter:site" content="@ReadupDotCom" />
		<meta name="twitter:app:id:iphone" content="1441825432" />
		<meta name="twitter:app:id:ipad" content="1441825432" />`			
			);
			break;
		case TwitterCardType.Summary:
			if (twitterCard.imageUrl) {
				twitterCardMarkup = (
		`<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@ReadupDotCom" />
		<meta name="twitter:title" content="${escapeQuotes(twitterCard.title)}" />
		<meta name="twitter:description" content="${escapeQuotes(twitterCard.description)}" />
		<meta name="twitter:image" content="${escapeQuotes(twitterCard.imageUrl)}" />`
				);
			} else {
				twitterCardMarkup = (
		`<meta name="twitter:card" content="summary" />
		<meta name="twitter:site" content="@ReadupDotCom" />
		<meta name="twitter:title" content="${escapeQuotes(twitterCard.title)}" />
		<meta name="twitter:description" content="${escapeQuotes(twitterCard.description)}" />`
				);
			}
			break;
	}
	return (
`<!DOCTYPE html>
<html lang="en" data-client-type="${initData.clientType}">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover" />
		<meta name="google-site-verification" content="9getaJHrSnp0LPyHlFeOT5cJ7fPK-EchoUkPRcAo8S0" />
		${noIndex ?
			'<meta name="robots" content="noindex" />' :
			''}
		${twitterCardMarkup || ''}
		<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="/bundle.css" />
		<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/${chromeExtensionId}">
		<title>${title}</title>
		<!-- Global site tag (gtag.js) - Google Analytics -->
		${initData.analyticsTrackingCode ?
			`<script async src="https://www.googletagmanager.com/gtag/js?id=${initData.analyticsTrackingCode}"></script>` :
			'<!-- analytics disabled in dev mode -->'}
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());

			gtag(
				'config',
				'${initData.analyticsTrackingCode}',
				${JSON.stringify(gtagConfig)}
			);
		</script>
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
		<script type="text/javascript" src="/bundle.js"></script>
		${initData.captchaSiteKey ?
			`<script async src='https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoaded&render=${initData.captchaSiteKey}'></script>` :
			'<!-- captcha disabled in dev mode -->'}
	</body>
</html>`
	);
}