import Request from '../api/Request';
import UserAccount from '../api/models/UserAccount';
import Endpoint from '../api/Endpoint';
import icons from '../../../common/svg/icons';

export default (model: {
	title: string,
	content: string,
	contentRootPath: string,
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
		<link rel="icon" type="image/x-icon" href="${model.contentRootPath}/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="${model.contentRootPath}/bundle.css" />
		<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/${model.extensionId}">
		<title>${model.title}</title>
	</head>
	<body>
		${icons}
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			window._apiEndpoint = ${JSON.stringify(model.apiEndpoint)};
			window._apiInitData = ${JSON.stringify(model.apiInitData)};
			window._userInitData = ${JSON.stringify(model.userInitData)};
			window._extensionId = ${JSON.stringify(model.extensionId)};
		</script>
		<script type="text/javascript" src="${model.contentRootPath}/bundle.js"></script>
	</body>
</html>`