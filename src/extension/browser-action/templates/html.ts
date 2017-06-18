import icons from '../../../common/svg/icons';

export default
`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<link rel="stylesheet" type="text/css" href="./bundle.css" />
		<title>browser-action</title>
	</head>
	<body>
		${icons}
		<div id="root"></div>
		<script type="text/javascript" src="./bundle.js"></script>
	</body>
</html>`;