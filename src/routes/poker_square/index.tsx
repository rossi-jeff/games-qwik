import {
	component$,
	useStore,
	$,
	type QwikDragEvent,
	useSignal,
	type QwikChangeEvent,
	noSerialize,
	useVisibleTask$,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import type { CardArray } from '../../types/card-container.type'
import { PlayingCard } from '../../components/playing-card/playing-card'
import { Deck } from '../../lib/deck.class'
import { Card } from '../../lib/card.class'
import type { PokerSquare } from '../../types/poker-square.type'
import { GameStatus } from '../../enum/game-status.enum'
import { RestClient } from '../../lib/rest-client'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'

export default component$(() => {
	const game = useSignal<PokerSquare>({})
	const state = useStore<{
		stock: CardArray
		waste: CardArray
		grid: { [key: string]: { [key: number]: CardArray } }
		row: string
		column: number
	}>({
		stock: [],
		waste: [],
		grid: {
			A: { 1: [], 2: [], 3: [], 4: [], 5: [] },
			B: { 1: [], 2: [], 3: [], 4: [], 5: [] },
			C: { 1: [], 2: [], 3: [], 4: [], 5: [] },
			D: { 1: [], 2: [], 3: [], 4: [], 5: [] },
			E: { 1: [], 2: [], 3: [], 4: [], 5: [] },
		},
		row: 'A',
		column: 1,
	})
	const scores = useStore<{
		rows: { [key: string]: number }
		columns: { [key: number]: number }
		total: number
	}>({
		rows: { A: 0, B: 0, C: 0, D: 0, E: 0 },
		columns: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
		total: 0,
	})
	const rows = ['A', 'B', 'C', 'D', 'E']
	const columns = [1, 2, 3, 4, 5]
	const dragging = useSignal('')
	const playing = useSignal(false)
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})

	const noop = $(() => {})

	const clearState = $(() => {
		state.stock = []
		state.waste = []
		state.row = 'A'
		state.column = 1
		for (const row of rows) {
			scores.rows[row] = 0
			for (const column of columns) {
				scores.columns[column] = 0
				state.grid[row][column] = []
			}
		}
	})

	const createGame = $(async () => {
		const client = new RestClient()
		const req = await client.post({
			path: 'api/poker_square',
			payload: {},
			headers: headers.value,
		})
		if (req.ok) {
			game.value = await req.json()
			scores.total = 0
		}
	})

	const deal = $(() => {
		const deck = new Deck()
		deck.shuffle()
		deck.preload()

		let counter = 0
		while (counter < 25) {
			const card = deck.draw()
			if (card) {
				card.facedown = true
				card.clickable = true
				state.stock.push(noSerialize(card))
			}
			counter++
		}
		createGame()
		playing.value = true
	})

	const updateGame = $(async (Status: GameStatus) => {
		if (!game.value.id) return
		const Score = scores.total
		const client = new RestClient()
		const req = await client.patch({
			path: `api/poker_square/${game.value.id}`,
			payload: { Status, Score },
		})
		if (req.ok) {
			game.value = await req.json()
			clearState()
		}
	})

	const quit = $(() => {
		clearState()
		updateGame(GameStatus.Lost)
		playing.value = false
	})

	const stockCardClicked = $(() => {
		if (state.waste.length || !state.stock.length) return
		const card = state.stock.pop()
		if (card) {
			card.facedown = false
			card.clickable = false
			card.draggable = true
			state.waste.push(noSerialize(card))
		}
	})

	const onDragStart = $(
		(_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
			dragging.value = target.id
		}
	)

	const highLightCell = $(() => {
		const el = document.getElementById(`cell_${state.row}_${state.column}`)
		if (el) {
			el.classList.add('highlight')
			setTimeout(() => {
				el.classList.remove('highlight')
			}, 500)
		}
	})

	const selectChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
		switch (e.target.name) {
			case 'row':
				state.row = e.target.value
				break
			case 'column':
				state.column = parseInt(e.target.value)
				break
		}
		highLightCell()
	})

	const isTwoPair = $((values: number[]) => {
		const idx = values.indexOf(2)
		if (idx == -1) return false
		return idx != values.lastIndexOf(2)
	})

	const isStraight = $((order: number[]) => {
		const sorted = order.sort((a, b) => a - b)
		for (let i = 1; i < sorted.length; i++) {
			if (sorted[i - 1] + 1 != sorted[i]) return false
		}
		return true
	})

	const scoreHand = $(async (hand: Card[]) => {
		if (hand.length != 5) return 0
		const deck = new Deck()
		const data: {
			faces: string[]
			suits: { [key: string]: number }
			counts: { [key: string]: number }
			order: number[]
		} = {
			faces: [],
			suits: {},
			counts: {},
			order: [],
		}
		for (const card of hand) {
			data.faces.push(card.face)
			if (!data.suits[card.suit]) data.suits[card.suit] = 0
			if (!data.counts[card.face]) data.counts[card.face] = 0
			data.suits[card.suit]++
			data.counts[card.face]++
			data.order.push(deck.faces.indexOf(card.face))
		}
		const results: { [key: string]: boolean } = {}
		results['isFlush'] = Object.values(data.suits).includes(5)
		results['isThreeKind'] = Object.values(data.counts).includes(3)
		results['isFourKind'] = Object.values(data.counts).includes(4)
		results['isPair'] = Object.values(data.counts).includes(2)
		results['isFullHouse'] = results['isThreeKind'] && results['isPair']
		results['isTwoPair'] = await isTwoPair(Object.values(data.counts))
		results['isStraight'] = await isStraight(data.order)
		results['isStraightFlush'] = results['isFlush'] && results['isStraight']
		results['isRoyal'] =
			results['isStraightFlush'] && data.faces.includes('king')
		if (results['isRoyal']) return 100
		if (results['isStraightFlush']) return 75
		if (results['isFourKind']) return 50
		if (results['isFullHouse']) return 25
		if (results['isFlush']) return 20
		if (results['isStraight']) return 15
		if (results['isThreeKind']) return 10
		if (results['isTwoPair']) return 5
		if (results['isPair']) return 2
		return 0
	})

	const updateScores = $(async () => {
		let total = 0
		let hand: Card[] = []

		for (const row of rows) {
			hand = []
			for (const column of columns) {
				const current = state.grid[row][column][0]
				if (current) {
					const { suit, face, back, id } = current
					const card = new Card(suit, face, back, id)
					hand.push(card)
				}
			}
			scores.rows[row] = await scoreHand(hand)
			total += scores.rows[row]
		}

		for (const column of columns) {
			hand = []
			for (const row of rows) {
				const current = state.grid[row][column][0]
				if (current) {
					const { suit, face, back, id } = current
					const card = new Card(suit, face, back, id)
					hand.push(card)
				}
			}
			scores.columns[column] = await scoreHand(hand)
			total += scores.columns[column]
		}

		scores.total = total
		if (state.stock.length == 0 && state.waste.length == 0) {
			updateGame(GameStatus.Won)
		}
	})

	const placeCard = $(() => {
		if (!state.waste.length) return
		const cell = state.grid[state.row][state.column]
		if (cell.length) return
		const card = state.waste.pop()
		if (card) {
			card.clickable = false
			card.draggable = false
			cell.push(noSerialize(card))
		}
		updateScores()
	})

	const onDrop = $(
		async (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
			const to = target.id
			const parts = to.split('_')
			const cell = state.grid[parts[1]][parseInt(parts[2])]
			if (cell.length) return
			const card = state.waste.pop()
			if (card) {
				card.clickable = false
				card.draggable = false
				cell.push(noSerialize(card))
			}
			updateScores()
		}
	)

	useVisibleTask$(async () => {
		const stored = sessionStorage.getItem(sessionKey)
		if (stored) {
			const data: SessionData = JSON.parse(stored)
			sesssion.Token = data.Token
			sesssion.UserName = data.UserName
			sesssion.SignedIn = true
			headers.value = { Authorization: `Bearer ${data.Token}` }
		}
	})
	return (
		<div>
			<div class="flex flex-wrap justify-between">
				<div>
					{game.value.Status != GameStatus.Playing && (
						<button onClick$={deal} class="mr-4">
							Deal
						</button>
					)}
					{game.value.Status == GameStatus.Playing && (
						<button onClick$={quit} class="mr-4">
							Quit
						</button>
					)}
				</div>
				{game.value.Status != undefined && (
					<div>
						<strong class="mr-2">Status</strong>
						{game.value.Status}
					</div>
				)}
				<div>
					<strong class="mr-2">Total</strong>
					{scores.total}
				</div>
				<div>
					<Link href="/poker_square/scores">Top Scores</Link>
				</div>
			</div>
			<div class="flex flex-wrap">
				<div class="mr-8">
					<div class="card-container mb-4 mt-8" id="stock">
						{state.stock.map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={stockCardClicked}
								onDragStart={noop}
								from="stock"
							/>
						))}
					</div>
					<div class="card-container mb-4" id="waste">
						{state.waste.map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={onDragStart}
								from="waste"
							/>
						))}
					</div>
					<div class="mb-4">
						<label for="row" class="block">
							Row
						</label>
						<select name="row" onChange$={selectChanged}>
							{rows.map((r, i) => (
								<option key={i} value={r} selected={r == state.row}>
									{r}
								</option>
							))}
						</select>
					</div>
					<div class="mb-4">
						<label for="column" class="block">
							Column
						</label>
						<select name="column" onChange$={selectChanged}>
							{columns.map((c, i) => (
								<option key={i} value={c} selected={c == state.column}>
									{c.toString()}
								</option>
							))}
						</select>
					</div>
					<div>
						<button onClick$={placeCard}>Place Card</button>
						<div>{state.stock.length}</div>
					</div>
				</div>
				<div>
					<div class="flex flex-wrap">
						<div class="card-grid-corner mb-2 mr-2"></div>
						{columns.map((column, idx) => (
							<div key={idx} class="card-column-label mr-4 mb-2">
								{column}
							</div>
						))}
						<div class="card-grid-corner"></div>
					</div>
					{rows.map((row, idxR) => (
						<div key={idxR} class="flex flex-wrap mb-4">
							<div class="card-row-label mr-2">{row}</div>
							{columns.map((column, idxC) => (
								<div
									key={idxC}
									class="card-container mr-4"
									id={'cell_' + row + '_' + column}
									onDrop$={onDrop}
									preventdefault:dragover
								>
									{state.grid[row][column].map((card, index) => (
										<PlayingCard
											key={card ? card.id : index}
											card={card}
											index={index}
											level={0}
											onClick={noop}
											onDragStart={noop}
											from="grid"
										/>
									))}
								</div>
							))}
							<div class="card-row-label" id={'score-row-' + row}>
								{scores.rows[row]}
							</div>
						</div>
					))}
					<div class="flex flex-wrap">
						<div class="card-grid-corner mr-2"></div>
						{columns.map((column, idx) => (
							<div
								key={idx}
								class="card-column-label mr-4"
								id={'score-column-' + column}
							>
								{scores.columns[column]}
							</div>
						))}
						<div class="card-grid-corner"></div>
					</div>
				</div>
			</div>
		</div>
	)
})
