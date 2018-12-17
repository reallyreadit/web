import * as React from 'react';

export default (props: { onSetRef: (ref: HTMLInputElement) => void }) => (
	<input
		className="clipboard-text-input_wig4nu"
		ref={props.onSetRef}
		type="text"
	/>
)