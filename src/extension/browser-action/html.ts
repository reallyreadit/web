import icons from '../../common/svg/icons';

export default
`<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="./bundle.css" />
	</head>
	<body>
		${icons}
		<h1><a id="home-link" target="_blank">reallyread.it</a></h1>
		<div id="article-info">
			<h2 id="article-title"></h2>
			<label id="percent-complete">Percent Complete: <span></span></label> -
			<a id="comments" target="_blank"></a>
		</div>
		<div id="article-placeholder">
			No article found on page
		</div>
		<fieldset id="settings">
			<legend>Settings</legend>
			<label><input id="show-overlay" type="checkbox" />Show overlay</label>
		</fieldset>
		<script type="text/javascript" src="./bundle.js"></script>
	</body>
</html>`;