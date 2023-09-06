import {
	type QRL,
	component$,
	useSignal,
	$,
	useTask$,
	type QwikChangeEvent,
} from '@builder.io/qwik'

export interface PaginationControlsProps {
	count: number
	limit: number
	offset: number
	limitChanged: QRL<(limit: number) => void>
	pageChanged: QRL<(page: number) => void>
}

export const PaginationControls = component$<PaginationControlsProps>(
	(props) => {
		const { count, limit, offset } = props
		const limits = [5, 10, 25, 50]
		const pages = useSignal<number[]>([])
		const current = useSignal(1)
		const limitSelectChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
			props.limitChanged(parseInt(e.target.value))
		})
		const pageClicked = $((page: number) => {
			current.value = page
			props.pageChanged(page)
		})

		useTask$(({ track }) => {
			let page = 1
			let counter = 0
			pages.value = []
			const perPage = track(() => props.limit)
			while (counter < count) {
				pages.value.push(page)
				counter += perPage
				page += 1
			}
			current.value = Math.floor(offset / limit) + 1
		})
		return (
			<div class="flex flex-wrap justify-between">
				<div>
					<label for="per-page">Per Page</label>
					<select
						name="per-page"
						value={limit}
						onChange$={(e) => limitSelectChanged(e)}
					>
						{limits.map((l, i) => (
							<option key={i} value={l}>
								{l.toString()}
							</option>
						))}
					</select>
				</div>
				<div class="flex flex-wrap">
					{pages.value.map((p) => (
						<button
							key={p}
							onClick$={() => pageClicked(p)}
							disabled={p == current.value}
							class="ml-2"
						>
							{p}
						</button>
					))}
				</div>
			</div>
		)
	}
)
