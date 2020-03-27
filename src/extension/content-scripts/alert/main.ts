const globalContext = window.reallyreadit.alertContentScript;

function createAlertComponent() {
	const logo = document.createElement('img');
	logo.alt = 'Readup logo';
	logo.src = chrome.runtime.getURL('/content-scripts/ui/images/logo.svg');

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
	component.append(logo, promptText, buttonContainer);
	return component;
}

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