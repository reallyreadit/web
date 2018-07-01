import * as React from 'react';
import ChallengeScore from '../../../../common/models/ChallengeScore';
import * as className from 'classnames';
import CountdownTimer from './CountdownTimer';

interface Props {
	score: ChallengeScore | null,
	timeZoneName: string | null
}
export default class extends React.PureComponent<Props> {
	public render() {
		let score: ChallengeScore;
		if (this.props.score) {
			score = this.props.score;
		} else {
			score = {
				day: -1,
				level: -1
			}
		}
		let message: string;
		if (score.day === -1) {
			message = 'Take the challenge! Win pizza!';
		} else if (score.level === 0) {
			message = 'Climb the steps by reading at least one 5 min. long article per day!';
		} else if (score.level === 10) {
			message = 'You win! We\'ll contact you within 24 hrs to deliver your pizza!';
		} else if (score.day === score.level) {
			const daysRemaining = 10 - score.day;
			message = `Good job! Only ${daysRemaining} more ${daysRemaining > 1 ? 'days' : 'day'} to go!`;
		} else {
			message = 'If you don\'t read an article by the end of the day you\'ll have to start over!';
		}
		return (
			<div className="game-scene">
				<div className="content">
					<div className="layer background">
						<ol className="clouds">
							<li className="cloud"></li>
							<li className="cloud"></li>
							<li className="cloud"></li>
							<li className="cloud"></li>
							<li className="cloud"></li>
							<li className="cloud"></li>
							<li className="cloud"></li>
							<li className="cloud"></li>
						</ol>
						<ol className="water">
							<li className="water"></li>
							<li className="water"></li>
							<li className="water"></li>
						</ol>
					</div>
					<div
						className="layer platform"
						data-day={score.day}
						data-level={score.level}
					>
						<div className="land left">
							<div className="top-level">
								<div className="grass"></div>
								<div className="grass"></div>
							</div>
						</div>
						<ol className="steps">
							{Array.from(new Array(9), (v, k) => {
								const level = k + 1;
								let state: 'bubble' | 'rest' | 'jump' | undefined;
								if (level > score.level) {
									state = 'bubble';
								} else if (level === score.level) {
									if (level === score.day) {
										state = 'rest';
									} else {
										state = 'jump';
									}
								}
								return (
									<li
										key={k}
										className={className('step', state)}
										style={{ bottom: 8 + (k * 6) }}
									>
									</li>
								);
							})}
						</ol>
						<div className="land right">
							<div className="top-level">
								<div className="grass"></div>
								<div className="grass"></div>
							</div>
							<div className="fill"></div>
						</div>
					</div>
					<div className="layer text">
						{message ?
							<div className={className('message-box', { 'win': score.level === 10 })}>
								{message}
							</div> :
							null}
					</div>
				</div>
				<div className="status-bar">
					<CountdownTimer
						day={score.day}
						level={score.level}
						timeZoneName={this.props.timeZoneName}
					/>
				</div>
			</div>
		);
	}
}