import insertExtensionFontStyleElement from '../ui/insertExtensionFontStyleElement';

const globalContext = window.reallyreadit.alertContentScript;

function createAlertComponent() {
	const logoLight = document.createElement('img');
	logoLight.alt = 'Readup Logo';
	logoLight.className = 'logo-light';
	logoLight.src = chrome.runtime.getURL('/content-scripts/ui/images/logo.svg');

	const logoDark = document.createElement('img');
	logoDark.alt = 'Readup Logo';
	logoDark.className = 'logo-dark';
	logoDark.src = chrome.runtime.getURL('/content-scripts/ui/images/logo-white.svg');

	const promptText = document.createElement('div');
	promptText.classList.add('prompt-text');
	promptText.innerHTML = globalContext.alertContent;

	const dismissButton = document.createElement('button');
	dismissButton.textContent = 'Dismiss';
	dismissButton.addEventListener(
		'click',
		() => {
			component.classList.add('popping-out');
		}
	);

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('button-container');
	buttonContainer.append(dismissButton);

	const component = document.createElement('div');
	component.classList.add('alert');
	component.addEventListener(
		'animationend',
		event => {
			if (event.animationName === 'alert-pop-out') {
				globalContext.isActive = false;
				component.remove();
			}
		}
	);
	component.append(logoLight, logoDark, promptText, buttonContainer);
	return component;
}

insertExtensionFontStyleElement();

const componentStyleLink = document.createElement('link');
componentStyleLink.rel = 'stylesheet';
componentStyleLink.href = chrome.runtime.getURL('/content-scripts/alert/bundle.css');

const shadowHost = document.createElement('div');
shadowHost.style.position = 'fixed';
shadowHost.style.top = '0';
shadowHost.style.right = '0';
shadowHost.style.width = '0';
shadowHost.style.height = '0';
shadowHost.style.margin = '0';
shadowHost.style.padding = '0';
shadowHost.style.transform = 'none';
shadowHost.style.zIndex = '2147483647';

// set initial theme and listen for changes
function setTheme() {
	shadowHost.dataset['com_readup_theme'] = document.documentElement.dataset['com_readup_theme'];
}
setTheme();
window.addEventListener(
	'com.readup.themechange',
	() => {
		setTheme();
	}
);

const shadowRoot = document.body
	.appendChild(shadowHost)
	.attachShadow({
		mode: 'open'
	});

shadowRoot.append(componentStyleLink);

globalContext.display = () => {
	if (!globalContext.isActive) {
		shadowRoot.append(createAlertComponent());
		globalContext.isActive = true;
	}
};

globalContext.display();