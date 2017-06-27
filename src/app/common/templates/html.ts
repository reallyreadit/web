import UserAccount from '../../../common/models/UserAccount';
import icons from '../../../common/svg/icons';
import { InitData as PageInitData } from '../Page';
import { InitData as ApiInitData } from '../api/Api';

export default (model: {
	title: string,
	content: string,
	extensionId: string,
	contextInitData: {
		api: ApiInitData,
		extension: string,
		page: PageInitData,
		user: UserAccount
	}
}) => 
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
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