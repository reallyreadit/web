import icons from '../../../common/svg/icons';
import InitData from '../InitData';

export default (model: {
	content: string,
	extensionId: string,
	initData: InitData,
	noIndex: boolean,
	title: string
}) => {
	let gtagConfig: {
		send_page_view: boolean,
		user_id?: string
	} = {
		send_page_view: false
	};
	if (model.initData.userAccount) {
		gtagConfig.user_id = model.initData.userAccount.id.toString();
	}
	return (
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
		<meta name="google-site-verification" content="9getaJHrSnp0LPyHlFeOT5cJ7fPK-EchoUkPRcAo8S0" />
		${model.noIndex ?
			'<meta name="robots" content="noindex" />' :
			''}
		<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="/bundle.css" />
		<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/${model.extensionId}">
		<title>${model.title}</title>
		<!-- Global site tag (gtag.js) - Google Analytics -->
		${model.initData.analyticsTrackingCode ?
			`<script async src="https://www.googletagmanager.com/gtag/js?id=${model.initData.analyticsTrackingCode}"></script>` :
			'<!-- analytics disabled in dev mode -->'}
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());

			gtag(
				'config',
				'${model.initData.analyticsTrackingCode}',
				${JSON.stringify(gtagConfig)}
			);
		</script>
	</head>
	<body>
		${icons}
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			//<!--
			window.reallyreadit = {
				app: {
					initData: ${JSON.stringify(model.initData)}
				}
			};
			//-->
		</script>
		<script type="text/javascript" src="/bundle.js"></script>
		${model.initData.captchaSiteKey ?
			`<script async src='https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoaded&render=${model.initData.captchaSiteKey}'></script>` :
			'<!-- captcha disabled in dev mode -->'}
	</body>
</html>`
	);
}