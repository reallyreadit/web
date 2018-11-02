import * as React from 'react';
import Spinner from '../../../../common/components/Spinner';
import classNames from 'classnames';

interface Props {
	position?: 'absolute' | 'static'
}
const LoadingOverlay: React.SFC<Props> = (props: Props) => (
	<div className={classNames(
		'loading-overlay_zfgtd1',
		{ 'absolute': props.position === 'absolute' }
	)}>
		Loading...<Spinner />
	</div>
);
LoadingOverlay.defaultProps = {
	position: 'absolute'
};
export default LoadingOverlay;