import * as React from 'react';
import logoIcon from '../svg/logoIcon';
import logoText from '../../../common/svg/logoText';
import { Link } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import DialogManager from './DialogManager';
import AccountManager from './AccountManager';
import ReadReadinessBar from './ReadReadinessBar';
import Icon from '../../../common/components/Icon';
import Toaster from './Toaster';
import * as className from 'classnames';
import Button from '../../../common/components/Button';
import Separator from '../../../common/components/Separator';

export default class MainView extends PureContextComponent<{}, {}> {
	private _goToAbout = () => this.context.router.push('/about');
	private _goToHowItWorks = () => this.context.router.push('/how-it-works');
	private _reloadPage = () => this.context.page.reload();
	public componentDidMount() {
		this.context.page.addListener('change', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.page.removeListener('change', this._forceUpdate);
	}
	public render() {
		return (
			<div className="main-view">
				<ReadReadinessBar />
				<Toaster />
				<header>
					<div className="left-col">
						<div className="title">
							<Link to="/" className="logo-icon" dangerouslySetInnerHTML={{ __html: logoIcon }}></Link>
							<h1>
								<Link to="/" className="logo-text" dangerouslySetInnerHTML={{ __html: logoText }}></Link>
							</h1>
						</div>
						<div className="left-nav">
							<Button text="About" iconLeft="lightbulb" onClick={this._goToAbout} />
							<Button text="How it Works" iconLeft="question" onClick={this._goToHowItWorks} />
						</div>
					</div>
					<AccountManager />
				</header>
				<h2 className={className({
					'reloadable': this.context.page.isReloadable,
					'loading': this.context.page.isLoading
				})}>
					<span className="text">{this.context.page.title}</span>
					{this.context.page.isReloadable ?
						<Icon name="refresh" onClick={this._reloadPage} /> :
						null}
				</h2>
				<main>
					{this.props.children}
				</main>
				<footer>
					<Link to="/privacy">Privacy Policy</Link>
					<Separator />
					<a href="mailto:support@reallyread.it">support@reallyread.it</a>
				</footer>
				<DialogManager />
			</div>
		);
	}
}