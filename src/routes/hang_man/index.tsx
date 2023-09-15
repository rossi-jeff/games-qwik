import {
	component$,
	useSignal,
	$,
	useVisibleTask$,
	useStore,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import { HangManDrawing } from '~/components/hang-man-drawing/hang-man-drawing'
import { HangManLetters } from '~/components/hang-man-letters/hang-man-letters'
import {
	HangManOptions,
	type HangManOptionsType,
} from '~/components/hang-man-options/hang-man-options'
import { HangManSolution } from '~/components/hang-man-solution/hang-man-solution'
import { HangManWordDisplay } from '~/components/hang-man-word-display/hang-man-word-display'
import { GameStatus } from '~/enum/game-status.enum'
import { RestClient } from '~/lib/rest-client'
import type { HangMan } from '~/types/hang-man.type'
import type { Word } from '~/types/word.type'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'

export default component$(() => {
	const game = useSignal<HangMan>({})
	const word = useSignal<Word>({})
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})
	const inProgress = useSignal<HangMan[]>([])

	const loadInProgress = $(async () => {
		const client = new RestClient()
		const req = await client.get({
			path: 'api/hang_man/progress',
			headers: headers.value,
		})
		if (req.ok) inProgress.value = await req.json()
	})

	const newGame = $(async (options: HangManOptionsType) => {
		game.value = {}
		word.value = {}
		const { Min, Max } = options
		console.log({ Min, Max })
		const client = new RestClient()
		const reqW = await client.post({
			path: 'api/word/random',
			payload: { Min, Max },
		})
		if (reqW.ok) {
			word.value = await reqW.json()
			const WordId = word.value.id
			if (WordId) {
				const reqG = await client.post({
					path: 'api/hang_man',
					payload: { WordId },
					headers: headers.value,
				})
				if (reqG.ok) game.value = await reqG.json()
			}
		}
	})

	const reloadGame = $(async () => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.get({ path: `api/hang_man/${game.value.id}` })
		if (req.ok) {
			game.value = await req.json()
			if (game.value.word && !word.value.id) word.value = game.value.word
			if (game.value.Status != GameStatus.Playing && sesssion.SignedIn)
				loadInProgress()
		}
	})

	const guessLetter = $(async (letter: string) => {
		console.log('guessLetter', letter)
		const { Word } = word.value
		if (Word && game.value.id) {
			const client = new RestClient()
			const req = await client.post({
				path: `api/hang_man/${game.value.id}/guess`,
				payload: { Word, Letter: letter.toLowerCase() },
			})
			if (req.ok) {
				reloadGame()
			}
		}
	})

	const continueGame = $((id: number) => {
		game.value = { id, Correct: '', Wrong: '' }
		reloadGame()
	})

	useVisibleTask$(async () => {
		const stored = sessionStorage.getItem(sessionKey)
		if (stored) {
			const data: SessionData = JSON.parse(stored)
			sesssion.Token = data.Token
			sesssion.UserName = data.UserName
			sesssion.SignedIn = true
			headers.value = { Authorization: `Bearer ${data.Token}` }
			loadInProgress()
		}
	})
	return (
		<div>
			{game.value.Status != undefined && (
				<HangManDrawing wrong={game.value.Wrong || ''} />
			)}
			{word.value.Word && (
				<HangManWordDisplay
					word={word.value.Word}
					correct={game.value.Correct || ''}
				/>
			)}
			{game.value.Status == GameStatus.Playing && (
				<HangManLetters
					guessHangmanLetter={guessLetter}
					correct={game.value.Correct || ''}
					wrong={game.value.Wrong || ''}
				/>
			)}
			{game.value.Status == GameStatus.Lost && word.value.Word && (
				<HangManSolution word={word.value.Word} />
			)}
			{game.value.Status != GameStatus.Playing && (
				<HangManOptions newHangMan={newGame} />
			)}
			{game.value.Status != GameStatus.Playing &&
				inProgress.value.length > 0 && (
					<div>
						{inProgress.value.map((hm) => (
							<div key={hm.id} class="score-row">
								<div class="cell-10-left">
									<button onClick$={() => continueGame(hm.id || 0)}>
										Continue
									</button>
								</div>
								<div class="cell-20-center">{hm.Status}</div>
								<div class="cell-20-center">{hm.Score}</div>
								<div class="cell-20-center">{hm.Correct}</div>
								<div class="cell-20-right">{hm.Wrong}</div>
							</div>
						))}
					</div>
				)}
			<div>
				<Link href="/hang_man/scores">Top Scores</Link>
			</div>
		</div>
	)
})
