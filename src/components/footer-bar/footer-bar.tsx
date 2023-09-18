import { component$ } from '@builder.io/qwik'

export interface FooterBarProps {}

export const FooterBar = component$<FooterBarProps>(() => {
	return (
		<div class="flex flex-wrap justify-between m-2">
			<div>All Games Constructed by Jeff Rossi</div>
			<div>
				<a href="mailto:inquiries@jeff-rossi.com">inquiries@jeff-rossi.com</a>
			</div>
		</div>
	)
})
