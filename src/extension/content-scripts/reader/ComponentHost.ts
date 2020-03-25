import * as React from 'react';
import * as ReactDOM from 'react-dom';
import icons from '../../../common/svg/icons';

export type DomAttachmentDelegate = (shadowHost: HTMLElement) => void;
export default abstract class ComponentHost<Services, State> {
	protected abstract readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	private readonly _domAttachmentDelegate: DomAttachmentDelegate;
	private _isAttached = false;
	private readonly _reactContainer: HTMLElement;
	protected abstract readonly _services: Services;
	private readonly _shadowHost: HTMLElement;
	private readonly _shadowRoot: ShadowRoot;
	protected abstract _state: State;
	constructor(
		{
			domAttachmentDelegate
		}: {
			domAttachmentDelegate: DomAttachmentDelegate
		}
	) {
		// store the dom attachment delegate
		this._domAttachmentDelegate = domAttachmentDelegate;

		// create the react container and shadow host
		this._reactContainer = document.createElement('div');
		this._shadowHost = document.createElement('div');

		// create shadow root by attaching to host
		this._shadowRoot = this._shadowHost.attachShadow({
			mode: 'open'
		});

		// apply react compatibility hack to container (https://github.com/facebook/react/issues/9242)
		Object.defineProperty(
			this._reactContainer,
			'ownerDocument',
			{
				value: this._shadowRoot
			}
		);
		(this._shadowRoot as any).createElement = (...args: any[]) => (document as any).createElement(...args);
		(this._shadowRoot as any).createElementNS = (...args: any[]) => (document as any).createElementNS(...args);
		(this._shadowRoot as any).createTextNode = (...args: any[]) => (document as any).createTextNode(...args);
	}
	protected setState(nextState: Partial<State>) {
		ReactDOM.render(
			React.createElement(
				this._component,
				{
					...this._services,
					...(
						this._state = {
							...this._state,
							...nextState
						}
					)
				}
			),
			this._reactContainer
		);
	}
	public attach() {
		// check if we're already attached
		if (this._isAttached) {
			return;
		}
		this._isAttached = true;

		// create the shadow dom style link
		const styleLink = document.createElement('link');
		styleLink.rel = 'stylesheet';
		styleLink.href = window.reallyreadit.extension.config.extensionUrl + '/content-scripts/reader/bundle.css';

		// create the svg icons
		const iconsElement = document.createElement('div');
		iconsElement.innerHTML = icons;

		// append children to root
		this._shadowRoot.append(styleLink, iconsElement, this._reactContainer);

		// append the root to the document
		this._domAttachmentDelegate(this._shadowHost);
	}
}