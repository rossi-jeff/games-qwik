import {
	component$,
	useSignal,
	$,
	useStore,
	useTask$,
	useVisibleTask$,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import type { GuessWord } from '../../types/guess-word.type'
import { GuessWordOptions } from '../../components/guess-word-options/guess-word-options'
import type { Word } from '../../types/word.type'
import { RestClient } from '../../lib/rest-client'
import { GuessWordGuessForm } from '../../components/guess-word-guess-form/guess-word-guess-form'
import { GuessWordGuessList } from '../../components/guess-word-guess-list/guess-word-guess-list'
import type { HintArgsType } from '../../types/hint-args.type'
import { GuessWordHintList } from '../../components/guess-word-hint-list/guess-word-hint-list'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'
import { GameStatus } from '../../enum/game-status.enum'

export default component$(() => {
	const game = useSignal<GuessWord>({})
	const word = useSignal<Word>({})
	const length = useSignal(5)
	const hints = useSignal<string[]>([])
	const hintArgs = useStore<HintArgsType>({
		Length: 5,
		Gray: [],
		Green: [],
		Brown: [],
	})
	const showHints = useSignal(false)
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})
	const inProgress = useSignal<GuessWord[]>([])

	const loadInProgress = $(async () => {
		const client = new RestClient()
		const req = await client.get({
			path: 'api/guess_word/progress',
			headers: headers.value,
		})
		if (req.ok) inProgress.value = await req.json()
	})

	const newGame = $(async (Length: number) => {
		length.value = Length
		const client = new RestClient()
		const wordReq = await client.post({
			path: 'api/word/random',
			payload: { Length },
		})
		if (wordReq.ok) {
			word.value = await wordReq.json()
			const WordId = word.value.id
			const gameReq = await client.post({
				path: 'api/guess_word',
				payload: { WordId },
				headers: headers.value,
			})
			if (gameReq.ok) game.value = await gameReq.json()
		}
	})

	const updateHintArgs = $(() => {
		hintArgs.Brown = []
		hintArgs.Gray = []
		hintArgs.Green = []
		for (let i = 0; i < hintArgs.Length; i++) {
			hintArgs.Brown[i] = []
			hintArgs.Green.push('')
		}
		if (game.value.guesses && game.value.guesses.length > 0) {
			for (const guess of game.value.guesses) {
				if (guess.ratings && guess.ratings.length > 0) {
					for (let i = 0; i < guess.ratings.length; i++) {
						const rating = guess.ratings[i]
						const lettter = guess.Guess ? guess.Guess[i] : ''
						if (lettter) {
							switch (rating.Rating) {
								case 'Gray':
									hintArgs.Gray.push(lettter)
									break
								case 'Brown':
									hintArgs.Brown[i].push(lettter)
									break
								case 'Green':
									hintArgs.Green[i] = lettter
									break
							}
						}
					}
				}
			}
		}
	})

	const fetchHints = $(async () => {
		if (game.value.guesses == undefined || game.value.guesses.length <= 0)
			return
		await updateHintArgs()
		const client = new RestClient()
		const req = await client.post({
			path: 'api/guess_word/hint',
			payload: hintArgs,
		})
		if (req.ok) {
			hints.value = await req.json()
		}
	})

	const toggleHints = $(() => {
		showHints.value = !showHints.value
		if (showHints.value) {
			fetchHints()
		} else {
			hints.value = []
		}
	})

	const reloadGame = $(async () => {
		if (!game.value.id) return
		const client = new RestClient()
		const req = await client.get({ path: `api/guess_word/${game.value.id}` })
		if (req.ok) {
			game.value = await req.json()
			if (showHints.value) fetchHints()
			if (game.value.word && !word.value.id) word.value = game.value.word
			if (word.value.Length) length.value = word.value.Length
			if (game.value.Status != GameStatus.Playing && sesssion.SignedIn)
				loadInProgress()
		}
	})

	const sendGuess = $(async (letters: string[]) => {
		if (!game.value.id) return
		const Guess = letters.join('').toLowerCase()
		const { Word } = word.value
		const client = new RestClient()
		const req = await client.post({
			path: `api/guess_word/${game.value.id}/guess`,
			payload: { Guess, Word },
		})
		if (req.ok) reloadGame()
	})

	const continueGame = $((id: number) => {
		game.value = { id }
		reloadGame()
	})

	useTask$(({ track }) => {
		const current = track(() => length.value)
		hintArgs.Length = current
		hintArgs.Brown = []
		hintArgs.Gray = []
		hintArgs.Green = []
		for (let i = 0; i < current; i++) {
			hintArgs.Brown[i] = []
			hintArgs.Green.push('')
		}
		hints.value = []
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
			{game.value.guesses && (
				<GuessWordGuessList guesses={game.value.guesses} />
			)}
			{game.value.Status == 'Playing' && (
				<GuessWordGuessForm
					length={length.value}
					sendGuesWordGuess={sendGuess}
				/>
			)}
			{game.value.Status == 'Playing' && (
				<GuessWordHintList
					show={showHints.value}
					hints={hints.value}
					toggleHints={toggleHints}
				/>
			)}
			{game.value.Status != 'Playing' && (
				<GuessWordOptions newGuessWord={newGame} />
			)}
			{game.value.Status != 'Playing' && inProgress.value.length > 0 && (
				<div class="mt-2">
					<div class="score-header">
						<div class="cell-10-left"></div>
						<div class="cell-20-center">Status</div>
						<div class="cell-20-center">Score</div>
						<div class="cell-20-right">Length</div>
					</div>
					{inProgress.value.map((gw) => (
						<div key={gw.id} class="score-row">
							<div class="cell-10-left">
								<button onClick$={() => continueGame(gw.id || 0)}>
									Continue
								</button>
							</div>
							<div class="cell-20-center">{gw.Status}</div>
							<div class="cell-20-center">{gw.Score}</div>
							<div class="cell-20-right">
								{gw.word ? gw.word.Length : 'N/A'}
							</div>
						</div>
					))}
				</div>
			)}
			<div>
				<Link href="/guess_word/scores">Top Scores</Link>
			</div>
		</div>
	)
})
