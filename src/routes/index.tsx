import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'

export default component$(() => {
	return (
		<div id="home-content">
			<h1>Welcome Visitor</h1>
			<div class="mb-2">
				The pages of this site are a collection of games written in typescript.
				They have <a href="https://nestjs.com/">NestJS</a> backend and a{' '}
				<a href="https://www.mysql.com/">MySQL</a> database and most
				calculations are performed on the server.
			</div>
			<div class="mb-2">
				The site itself was constructed using the following tools and resources:
				<ul>
					<li>
						<a href="https://qwik.builder.io/" target="_blank">
							Qwik
						</a>{' '}
						- Qwik is a new kind of web framework that can deliver instant
						loading web applications at any size or complexity. Your sites and
						apps can boot with about 1kb of JS (regardless of application
						complexity), and achieve consistent performance at scale (site
						documentation)
					</li>
					<li>
						<a href="https://tailwindcss.com/">Tailwind CSS</a> -
						<i>
							A utility-first CSS framework packed with classes like flex, pt-4,
							text-center and rotate-90 that can be composed to build any
							design, directly in your markup.
						</i>
						(site documentation)
					</li>
					<li>
						Dice images downloaded from <a href="https://css.gg/">CSS.GG</a>
					</li>
					<li>
						Playing Card images downloaded from
						<a href="https://tekeye.uk/playing_cards/svg-playing-cards">
							Tek Eye
						</a>
					</li>
				</ul>
			</div>
			<div class="mb-2">
				Take some time to play a few games and think about the problem solving
				skills involved in constucting them.
			</div>
			<div class="mb-2">
				The register and sign in dialogs serve two purposes:
				<ul>
					<li>proof of concept for user management</li>
					<li>scores will show a username rather than anonymous</li>
					<li>you may continue some in progress games</li>
				</ul>
				No contact information is collected.
			</div>
			<div>
				The source code for the games site and the backend are available upon
				request.
			</div>
		</div>
	)
})

export const head: DocumentHead = {
	title: 'Welcome to Qwik',
	meta: [
		{
			name: 'description',
			content: 'Qwik site description',
		},
	],
}
