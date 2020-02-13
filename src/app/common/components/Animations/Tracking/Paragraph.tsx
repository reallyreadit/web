import * as React from 'react';

export default (
	props: {
		lastLineWidth?: number,
		lineCount: number
	}
) => (
	<p className="paragraph_wznl0z">
		{Array
			.from(new Array(props.lineCount))
			.map(
				(_, index) => (
					<span
						key={index}
						style={
							index === props.lineCount - 1 && props.lastLineWidth ?
								{ width: props.lastLineWidth + '%' } :
								null
						}
					></span>
				)
			)}
	</p>
);