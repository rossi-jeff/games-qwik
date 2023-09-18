import { component$, Slot } from '@builder.io/qwik'
import type { RequestHandler } from '@builder.io/qwik-city'
import { HeaderBar } from '../components/header-bar/header-bar'
import { FooterBar } from '../components/footer-bar/footer-bar'

export const onGet: RequestHandler = async ({ cacheControl }) => {
	// Control caching for this request for best performance and to reduce hosting costs:
	// https://qwik.builder.io/docs/caching/
	cacheControl({
		// Always serve a cached response by default, up to a week stale
		staleWhileRevalidate: 60 * 60 * 24 * 7,
		// Max once every 5 seconds, revalidate on the server to get a fresh version of this page
		maxAge: 5,
	})
}

export default component$(() => {
	return (
		<div class="flex flex-col h-screen">
			<HeaderBar />
			<div class="m-2 flex-grow overflow-y-auto">
				<Slot />
			</div>
			<FooterBar />
		</div>
	)
})
