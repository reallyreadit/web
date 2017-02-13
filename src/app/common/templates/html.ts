import Request from '../api/Request';
import UserAccount from '../api/models/UserAccount';
import Endpoint from '../api/Endpoint';

export default (model: {
	title: string,
	content: string,
	contentRootPath: string,
	apiEndpoint: Endpoint,
	apiInitData: Request[],
	userInitData: UserAccount
}) => 
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<link rel="icon" type="image/x-icon" href="${model.contentRootPath}/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="${model.contentRootPath}/bundle.css" />
		<title>${model.title}</title>
	</head>
	<body>
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			window._apiEndpoint = ${JSON.stringify(model.apiEndpoint)};
			window._apiInitData = ${JSON.stringify(model.apiInitData)};
			window._userInitData = ${JSON.stringify(model.userInitData)};
		</script>
		<script type="text/javascript" src="${model.contentRootPath}/bundle.js"></script>
	</body>
</html>`