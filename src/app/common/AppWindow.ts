import InitData from '../common/InitData';

declare global {
	interface AppWindow {
		initData: InitData
	}
}