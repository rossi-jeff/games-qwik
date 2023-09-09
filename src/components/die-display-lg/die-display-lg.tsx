import { type QRL, component$, type QwikDragEvent } from '@builder.io/qwik'

export interface DieDisplayLgProps {
	face: number
	index: number
	from: string
	draggable: boolean
	dragStart: QRL<
		(event: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => void
	>
}

export const DieDisplayLg = component$<DieDisplayLgProps>((props) => {
	const { face, index, from, draggable } = props
	return (
		<div
			class="die-display-lg"
			id={from + '_' + index}
			draggable={draggable}
			onDragStart$={props.dragStart}
		>
			<img
				src={'/dice/dice-' + face + '.svg'}
				alt={'Die ' + face}
				width="60"
				height="60"
				class="die-lg"
				draggable={false}
			/>
		</div>
	)
})
