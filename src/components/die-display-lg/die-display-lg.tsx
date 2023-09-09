import { component$ } from '@builder.io/qwik'

export interface DieDisplayLgProps {
	face: number
}

export const DieDisplayLg = component$<DieDisplayLgProps>((props) => {
	const { face } = props
	return (
		<div class="die-display-lg">
			<img
				src={'/dice/dice-' + face + '.svg'}
				alt={'Die ' + face}
				width="60"
				height="60"
				class="die-lg"
			/>
		</div>
	)
})
