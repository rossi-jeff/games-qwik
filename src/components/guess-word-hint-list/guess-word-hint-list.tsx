import { component$, $, type QRL } from '@builder.io/qwik'

export interface GuessWordHintListProps {
	hints: string[]
	show: boolean
	toggleHints: QRL<() => void>
}

export const GuessWordHintList = component$<GuessWordHintListProps>((props) => {
	const { hints, show } = props

	const toggle = $(() => {
		props.toggleHints()
	})
	return (
		<div>
			<div>
				<input type="checkbox" name="show" checked={show} onChange$={toggle} />
				<label for="show">Show Hints</label>
			</div>
			<div class="hints-list">
				{hints.map((h, i) => (
					<div key={i}>{h}</div>
				))}
			</div>
		</div>
	)
})
