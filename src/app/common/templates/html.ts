import icons from '../../../common/svg/icons';
import ContextInitData from '../ContextInitData';

export default (model: {
	title: string,
	content: string,
	extensionId: string,
	contextInitData: ContextInitData,
	enableAnalytics: boolean
}) => 
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
		<title>${model.title}</title>
	</head>
	<body>
		${icons}
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			window._contextInitData = ${JSON.stringify(model.contextInitData)};
		</script>
		<script type="text/javascript" src="/bundle.js"></script>
	</body>
</html>`