import Request from './Request';
import { createUrl } from '../../common/HttpEndpoint';
import { createQueryString } from '../../common/routing/queryString';
import InstallationRequest from '../../common/models/extension/InstallationRequest';
import InstallationResponse from '../../common/models/extension/InstallationResponse';

function addCustomHeaders(req: XMLHttpRequest, params: Request) {
	req.setRequestHeader('X-Readup-Client', `web/extension@${window.reallyreadit.extension.config.version.extension}`);
}
export default class ServerApi {
	private fetchJson<T>(request: Request) {
		return new Promise<T>((resolve, reject) => {
			const
				req = new XMLHttpRequest(),
				url = createUrl(window.reallyreadit.extension.config.apiServer, request.path);
			req.withCredentials = true;
			req.addEventListener('load', function () {
				const contentType = this.getResponseHeader('Content-Type');
				let object: any;
				if (
					contentType?.startsWith('application/json') ||
					contentType?.startsWith('application/problem+json')
				) {
					object = JSON.parse(this.responseText);
				}
				if (this.status === 200) {
					if (object) {
						resolve(object);
					} else {
						resolve(null);
					}
				} else {
					if (this.status === 401) {
						console.log(`[ServerApi] user signed out (received 401 response from API server)`);
					}
					reject(object || ['ServerApi XMLHttpRequest load event. Status: ' + this.status + ' Status text: ' + this.statusText + ' Response text: ' + this.responseText]);
				}
			});
			req.addEventListener('error', function () {
				reject(['ServerApi XMLHttpRequest error event']);
			});
			if (request.method === 'POST') {
				req.open(request.method, url);
				addCustomHeaders(req, request);
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(request.data));
			} else {
				req.open(request.method, url + createQueryString(request.data));
				addCustomHeaders(req, request);
				req.send();
			}
		});
	}
	public logExtensionInstallation(data: InstallationRequest) {
		return this.fetchJson<InstallationResponse>({
			method: 'POST',
			path: '/Extension/Install',
			data
		});
	}
}