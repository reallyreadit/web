import Request from '../api/Request';
import UserAccount from '../api/models/UserAccount';
import Endpoint from '../api/Endpoint';
import icons from '../../../common/svg/icons';
import { InitData as PageInitData } from '../Page';

export default (model: {
	pageInitData: PageInitData,
	content: string,
	apiEndpoint: Endpoint,
	apiInitData: Request[],
	userInitData: UserAccount,
	extensionId: string
}) => 
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="/bundle.css" />
		<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/${model.extensionId}">
		<title>${model.pageInitData.title}</title>
	</head>
	<body>
		${icons}
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			window._pageInitData = ${JSON.stringify(model.pageInitData)};
			window._apiEndpoint = ${JSON.stringify(model.apiEndpoint)};
			window._apiInitData = ${JSON.stringify(model.apiInitData)};
			window._userInitData = ${JSON.stringify(model.userInitData)};
			window._extensionId = ${JSON.stringify(model.extensionId)};
		</script>
		<script type="text/javascript" src="/bundle.js"></script>
	</body>
</html>`