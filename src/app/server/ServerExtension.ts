import Extension from '../common/Extension';

export default class ServerExtension extends Extension {
    public isInstalled() {
        return false;
    }
    public isBrowserCompatible() {
        return false;
    }
}