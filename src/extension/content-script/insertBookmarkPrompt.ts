import * as smoothscroll from 'smoothscroll-polyfill';

const styleContent = `
@font-face {
	font-family: 'Museo Sans (300)';
	src: url("chrome-extension://{EXTENSION_ID}/content-script/embed/fonts/museo-sans-300.ttf");
}
@font-face {
	font-family: 'Museo Sans (500)';
	src: url("chrome-extension://{EXTENSION_ID}/content-script/embed/fonts/museo-sans-500.ttf");
}
@font-face {
	font-family: 'Museo Sans (700)';
	src: url("chrome-extension://{EXTENSION_ID}/content-script/embed/fonts/museo-sans-700.ttf");
}
.com_readup_bookmark-prompt {
	position: fixed;
	z-index: 2147483647;
	top: 10%;
	text-align: center;
	padding: 10px;
	background-color: white;
	border: 1px solid #e0e0e0;
	border-radius: 3px;
	box-shadow: 0px 0px 1px -1px black;
	font-family: 'Museo Sans (300)';
	font-size: 13pt;
	animation: com_readup_bookmark-prompt-pop-in 500ms forwards;
}
.com_readup_bookmark-prompt.popping-out {
	animation: com_readup_bookmark-prompt-pop-out 500ms;
}
.com_readup_bookmark-prompt::before {
	content: "";
	display: block;
	height: 30px;
	margin-bottom: 10px;
	background-image: url('chrome-extension://{EXTENSION_ID}/content-script/embed/images/logo.svg');
	background-size: 50px;
	background-repeat: no-repeat;
	background-position: center;
}
.com_readup_bookmark-prompt > .com_readup_prompt-text {
	width: 180px;
	margin-bottom: 15px;
}
.com_readup_bookmark-prompt > .com_readup_button-container {
	display: flex;
	justify-content: space-between;
}
.com_readup_bookmark-prompt > .com_readup_button-container > .com_readup_button {
	display: inline-flex;
	align-items: center;
	height: 32px;
	box-sizing: border-box;
	padding: 0 10px;
	cursor: pointer;
	font-family: 'Museo Sans (500)', sans-serif;
}
.com_readup_bookmark-prompt > .com_readup_button-container > .com_readup_button.com_readup_preferred {
	border: 2px solid #2A2326;
	font-family: 'Museo Sans (700)';
}
@keyframes com_readup_bookmark-prompt-pop-in {
	0% {
		right: 0;
		transform: translateX(100%);
	}
	75% {
		right: 5%;
		transform: translateX(-25%);
	}
	100% {
		right: 5%;
		transform: translateX(0);
	}
}
@keyframes com_readup_bookmark-prompt-pop-out {
	0% {
		right: 5%;
		transform: translateX(0);
	}
	100% {
		right: 0;
		transform: translateX(100%);
	}
}`;
export default function insertBookmarkPrompt({
	onConfirm
}: {
	onConfirm: () => void
}) {
	const styleElement = window.document.createElement('style');
	styleElement.type = 'text/css';
	styleElement.textContent = styleContent.replace(
		/\{EXTENSION_ID\}/g,
		window.reallyreadit.extension.config.extensionId
	);
	window.document.body.append(styleElement);

	function beginClosingPrompt() {
		prompt.classList.add('popping-out');
	}

	const promptText = window.document.createElement('div');
	promptText.classList.add('com_readup_prompt-text');
	promptText.textContent = 'Want to pick up where you left off?';

	const cancelButton = window.document.createElement('div');
	cancelButton.classList.add('com_readup_button');
	cancelButton.textContent = 'No';
	cancelButton.addEventListener('click', beginClosingPrompt);

	const confirmButton = window.document.createElement('div');
	confirmButton.classList.add('com_readup_button', 'com_readup_preferred');
	confirmButton.textContent = 'Yes';
	confirmButton.addEventListener(
		'click',
		() => {
			onConfirm();
			beginClosingPrompt();
		}
	);

	const buttonContainer = window.document.createElement('div');
	buttonContainer.classList.add('com_readup_button-container');
	buttonContainer.append(cancelButton, confirmButton);

	const prompt = window.document.createElement('div');
	prompt.classList.add('com_readup_bookmark-prompt');
	prompt.append(promptText, buttonContainer);
	prompt.addEventListener(
		'animationend',
		event => {
			if (event.animationName === 'com_readup_bookmark-prompt-pop-out') {
				prompt.remove();
			}
		}
	);

	window.document.body.append(prompt);

	smoothscroll.polyfill();
}