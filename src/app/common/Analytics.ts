import { Screen } from './components/Root';

export type PageviewRawParams = {
	title: string,
	path: string
};
export type PageviewScreenParams = Pick<Screen, 'key' | 'location'>;
export type PageviewParams = PageviewRawParams | PageviewScreenParams;
export default abstract class Analytics {
	public abstract sendPageview(params: PageviewRawParams): void;
	public abstract sendPageview(params: PageviewScreenParams): void;
	public abstract sendSignUp(): void;
	public abstract setUserId(id: number | null): void;
}