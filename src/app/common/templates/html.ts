import icons from '../../../common/svg/icons';
import InitData from '../InitData';

export default (model: {
	content: string,
	enableAnalytics: boolean,
	extensionId: string,
	initData: InitData,
	iosAppId: string,
	title: string
}) => (
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
		<!-- Google Analytics -->
		<script>window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;</script>
		${model.enableAnalytics ?
			`<script async src='https://www.google-analytics.com/analytics.js'></script>` :
			`<!-- disabled in dev mode -->`}
		<!-- End Google Analytics -->
		<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="/bundle.css" />
		<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/${model.extensionId}">
		<meta name="apple-itunes-app" content="app-id=${model.iosAppId}" />
		<title>${model.title}</title>
	</head>
	<body>
		${icons}
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			window.reallyreadit = {
				app: {
					initData: ${JSON.stringify(model.initData)}
				}
			};
		</script>
		<script type="text/javascript" src="/bundle.js"></script>
		${model.initData.captchaSiteKey ?
			`<script async src='https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoaded&render=${model.initData.captchaSiteKey}'></script>` :
			'<!-- captcha disabled in dev mode -->'}
	</body>
</html>`
);