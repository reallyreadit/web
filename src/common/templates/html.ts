import Request from '../api/Request';
import UserAccount from '../api/models/UserAccount';
import Endpoint from '../api/Endpoint';

export default (model: {
	title: string,
	content: string,
	apiEndpoint: Endpoint,
	apiInitData: Request[],
	userInitData: UserAccount
}) => 
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<link rel="icon" type="image/x-icon" href="./bin/dev/browser/images/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="./bin/dev/browser/bundle.css" />
		<title>${model.title}</title>
	</head>
	<body>
		<div id="root">${model.content}</div>
		<script type="text/javascript">
			window._apiEndpoint = ${JSON.stringify(model.apiEndpoint)};
			window._apiInitData = ${JSON.stringify(model.apiInitData)};
			window._userInitData = ${JSON.stringify(model.userInitData)};
		</script>
		<script type="text/javascript" src="./bin/dev/browser/bundle.js"></script>
	</body>
</html>`