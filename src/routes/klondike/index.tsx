import {
	component$,
	useStore,
	$,
	useSignal,
	noSerialize,
	type QwikMouseEvent,
	type QwikDragEvent,
	type NoSerialize,
	useVisibleTask$,
} from '@builder.io/qwik'
import { type DocumentHead, Link } from '@builder.io/qwik-city'
import { PlayingCard } from '~/components/playing-card/playing-card'
import type { Card } from '~/lib/card.class'
import { Deck } from '~/lib/deck.class'
import type { CardContainerType } from '~/types/card-container.type'
import type { Klondike } from '../../types/klondike.type'
import { GameStatus } from '../../enum/game-status.enum'
import { RestClient } from '../../lib/rest-client'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'

export default component$(() => {
	const game = useSignal<Klondike>({})
	const tableau = useStore<CardContainerType>({
		'tableau-0': [],
		'tableau-1': [],
		'tableau-2': [],
		'tableau-3': [],
		'tableau-4': [],
		'tableau-5': [],
		'tableau-6': [],
	})
	const aces = useStore<CardContainerType>({
		'aces-0': [],
		'aces-1': [],
		'aces-2': [],
		'aces-3': [],
	})
	const util = useStore<CardContainerType>({
		stock: [],
		waste: [],
	})
	const moves = useSignal(0)
	const dragging = useSignal('')
	const playing = useSignal(false)
	const canAutoComplete = useSignal(false)
	const resets = useSignal(0)
	const resetLimit = 3
	const sesssion = useStore<SessionData>(blankSession)
	const headers = useSignal<{ [key: string]: string }>({})

	// begin timer code
	const clock = useStore<{
		interval: number
		initial: number
		elapsed: number
		formatted: string
	}>({
		interval: 0,
		initial: 0,
		elapsed: 0,
		formatted: '0:00',
	})

	const stopClock = $(() => {
		if (clock.interval) window.clearInterval(clock.interval)
	})

	const zeroPad = $((num: number, digits: number) => {
		let str = num.toString()
		while (str.length < digits) str = '0' + str
		return str
	})

	const startClock = $(async () => {
		clock.initial = Date.now()
		await stopClock()
		clock.interval = window.setInterval(async () => {
			clock.elapsed = Math.floor((Date.now() - clock.initial) / 1000)
			const seconds = await zeroPad(clock.elapsed % 60, 2)
			const minutes = Math.floor(clock.elapsed / 60)
			clock.formatted = `${minutes}:${seconds}`
		}, 1000)
	})
	// end timer code

	const initCardContainers = $(() => {
		util['stock'] = []
		util['waste'] = []
		for (let i = 0; i < 7; i++) tableau[`tableau-${i}`] = []
		for (let i = 0; i < 4; i++) aces[`aces-${i}`] = []
	})

	const createGame = $(async () => {
		const client = new RestClient()
		const req = await client.post({
			path: 'api/klondike',
			payload: {},
			headers: headers.value,
		})
		if (req.ok) {
			game.value = await req.json()
			clock.formatted = '0:00'
			startClock()
		}
	})

	const deal = $(() => {
		const deck = new Deck()
		deck.shuffle()
		deck.preload()

		for (let i = 0; i < 7; i++) {
			for (let j = i; j < 7; j++) {
				const card = deck.draw()
				if (card) {
					if (i == j) {
						card.facedown = false
						card.draggable = true
					}
					tableau[`tableau-${j}`].push(noSerialize(card))
				}
			}
		}

		while (deck.cards.length) {
			const card = deck.draw()
			if (card) {
				card.clickable = true
				card.facedown = true
				util['stock'].push(noSerialize(card))
			}
		}

		moves.value = 0
		resets.value = 0
		dragging.value = ''
		playing.value = true
		createGame()
		checkStatus()
	})

	const updateGame = $(async (Status: GameStatus) => {
		if (!game.value.id) return
		const { elapsed: Elapsed } = clock
		const Moves = moves.value
		const client = new RestClient()
		const req = await client.patch({
			path: `api/klondike/${game.value.id}`,
			payload: { Status, Elapsed, Moves },
		})
		if (req.ok) game.value = await req.json()
	})

	const quit = $(() => {
		initCardContainers()
		stopClock()
		updateGame(GameStatus.Lost)
		playing.value = false
	})

	const noop = $(() => {})

	const stockCardClicked = $(
		(
			event: QwikMouseEvent<HTMLDivElement, MouseEvent>,
			target: HTMLDivElement
		) => {
			const cardId = target.id.split('_')[2]
			event.stopPropagation()

			const card = util['stock'].pop()
			if (card && card.id == parseInt(cardId)) {
				card.clickable = false
				card.facedown = false
				card.draggable = true
				util['waste'].push(card)
				moves.value++
			} else if (card) {
				util['stock'].push(card)
			}
		}
	)

	const resetStock = $(() => {
		if (util['stock'].length || resets.value >= resetLimit) return
		while (util['waste'].length) {
			const card = util['waste'].pop()
			if (card) {
				card.facedown = true
				card.draggable = false
				card.clickable = true
				util['stock'].push(card)
			}
		}
		resets.value++
	})

	const onDragStart = $(
		(_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
			dragging.value = target.id
		}
	)

	const getDraggedCard = $(() => {
		let card: NoSerialize<Card> | undefined,
			quantity = 0,
			idx: number
		const parts = dragging.value.split('_')
		const from = parts[0]
		const cardId = parseInt(parts[2])
		switch (from) {
			case 'waste':
				idx = util['waste'].findIndex((c) => c && c.id == cardId)
				card = util['waste'][idx]
				quantity = idx != -1 ? util['waste'].length - idx : 0
				break
			case 'tableau-0':
			case 'tableau-1':
			case 'tableau-2':
			case 'tableau-3':
			case 'tableau-4':
			case 'tableau-5':
			case 'tableau-6':
			case 'tableau-7':
				idx = tableau[from].findIndex((c) => c && c.id == cardId)
				card = tableau[from][idx]
				quantity = idx != -1 ? tableau[from].length - idx : 0
				break
		}
		return { card, quantity }
	})

	const getTopCard = $((to: string) => {
		let card: NoSerialize<Card> | undefined, length: number
		switch (to) {
			case 'tableau-0':
			case 'tableau-1':
			case 'tableau-2':
			case 'tableau-3':
			case 'tableau-4':
			case 'tableau-5':
			case 'tableau-6':
			case 'tableau-7':
				length = tableau[to].length
				card = length > 0 ? tableau[to][length - 1] : undefined
				break
			case 'aces-0':
			case 'aces-1':
			case 'aces-2':
			case 'aces-3':
				length = aces[to].length
				card = length > 0 ? aces[to][length - 1] : undefined
				break
		}
		return card
	})

	const canDrop = $(
		(
			to: string,
			quanity: number,
			draggedCard: NoSerialize<Card> | undefined,
			topCard: NoSerialize<Card> | undefined
		) => {
			const deck = new Deck()
			if (draggedCard == undefined) return false
			switch (to) {
				case 'tableau-0':
				case 'tableau-1':
				case 'tableau-2':
				case 'tableau-3':
				case 'tableau-4':
				case 'tableau-5':
				case 'tableau-6':
				case 'tableau-7':
					if (topCard == undefined && draggedCard.face != 'king') {
						console.log('condition 1')
						return false
					}
					if (topCard && deck.color(topCard) == deck.color(draggedCard)) {
						console.log('condition 2')
						return false
					}
					if (
						topCard &&
						deck.faces.indexOf(topCard.face) !=
							deck.faces.indexOf(draggedCard.face) + 1
					) {
						console.log('condition 3')
						return false
					}
					break
				case 'aces-0':
				case 'aces-1':
				case 'aces-2':
				case 'aces-3':
					if (quanity > 1) {
						console.log('condition 4')
						return false
					}
					if (topCard == undefined && draggedCard.face != 'ace') {
						console.log('condition 5')
						return false
					}
					if (topCard && topCard.suit != draggedCard.suit) {
						console.log('condition 6')
						return false
					}
					if (
						topCard &&
						deck.faces.indexOf(draggedCard.face) !=
							deck.faces.indexOf(topCard.face) + 1
					) {
						console.log('condition 7')
						return false
					}
					break
			}
			return true
		}
	)

	const getAceCount = $(() => {
		let aceCount = 0
		for (const key in aces) {
			aceCount += aces[key].length
		}
		return aceCount
	})

	const checkStatus = $(async () => {
		const aceCount = await getAceCount()
		// auto complete is contrary to resumability
		let faceDownCount = 0

		for (const key in util) faceDownCount += util[key].length
		for (const key in tableau) {
			for (let i = 0; i < tableau[key].length; i++) {
				const card = tableau[key][i]
				if (card && card.facedown) faceDownCount++
			}
		}
		canAutoComplete.value = faceDownCount == 0 && aceCount != 0
		if (aceCount == 52) {
			stopClock()
			initCardContainers()
			updateGame(GameStatus.Won)
		}
	})

	const autoMoveCard = $(async (from: string, to: string) => {
		const card = tableau[from].pop()
		if (card) {
			aces[to].push(card)
			moves.value++
		}
	})

	const getAutoMoveCard = $(async () => {
		const deck = new Deck()
		let lowestCard: Card | undefined,
			topCard: Card | undefined,
			topAce: Card | undefined,
			from: string | undefined,
			to: string | undefined,
			length: number
		for (const key in tableau) {
			length = tableau[key].length
			if (length) {
				topCard = tableau[key][length - 1]
				if (topCard) {
					if (
						!lowestCard ||
						deck.faces.indexOf(topCard.face) <
							deck.faces.indexOf(lowestCard.face)
					) {
						lowestCard = topCard
						from = key
					}
				}
			}
		}
		if (from && lowestCard) {
			for (const key in aces) {
				length = aces[key].length
				if (length) {
					topAce = aces[key][length - 1]
					if (
						topAce &&
						topAce.suit == lowestCard.suit &&
						deck.faces.indexOf(lowestCard.face) ==
							deck.faces.indexOf(topAce.face) + 1
					) {
						to = key
					}
				} else if (lowestCard.face == '') {
					to = key
				}
			}
		}
		return { from, to }
	})

	const autoComplete = $(async () => {
		let aceCount = 0
		while (aceCount < 52) {
			const { from, to } = await getAutoMoveCard()
			if (from && to) {
				await autoMoveCard(from, to)
				aceCount = await getAceCount()
			}
		}
		checkStatus()
	})

	const moveCards = $((from: string, to: string, cardId: number) => {
		const toMove: Card[] = []
		let found = false
		switch (from) {
			case 'waste':
				while (!found) {
					const card = util['waste'].pop()
					if (card) {
						toMove.push(card)
						if (card.id == cardId) found = true
					}
				}
				break
			case 'tableau-0':
			case 'tableau-1':
			case 'tableau-2':
			case 'tableau-3':
			case 'tableau-4':
			case 'tableau-5':
			case 'tableau-6':
			case 'tableau-7':
				while (!found) {
					const card = tableau[from].pop()
					if (card) {
						toMove.push(card)
						if (card.id == cardId) {
							const length = tableau[from].length
							if (length) {
								const top = tableau[from][length - 1]
								if (top) {
									top.facedown = false
									top.draggable = true
									const tmp = tableau[from]
									tableau[from] = []
									setTimeout(() => {
										tableau[from] = tmp
									}, 0)
								}
							}
							found = true
						}
					}
				}
				break
		}
		switch (to) {
			case 'tableau-0':
			case 'tableau-1':
			case 'tableau-2':
			case 'tableau-3':
			case 'tableau-4':
			case 'tableau-5':
			case 'tableau-6':
			case 'tableau-7':
				while (toMove.length) {
					const card = toMove.pop()
					if (card) tableau[to].push(noSerialize(card))
				}
				break
			case 'aces-0':
			case 'aces-1':
			case 'aces-2':
			case 'aces-3':
				while (toMove.length) {
					const card = toMove.pop()
					if (card) {
						card.draggable = false
						aces[to].push(noSerialize(card))
					}
				}
				break
		}
		moves.value++
		checkStatus()
	})

	const onDrop = $(
		async (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
			const to = target.id
			const { card: draggedCard, quantity } = await getDraggedCard()
			const topCard = await getTopCard(to)
			const drop = await canDrop(to, quantity, draggedCard, topCard)
			if (!drop || !draggedCard) return
			const from = dragging.value.split('_')[0]
			moveCards(from, to, draggedCard.id)
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
			<div class="flex flex-wrap justify-between mb-4">
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
					{canAutoComplete.value && (
						<button onClick$={autoComplete}>Auto Complete</button>
					)}
				</div>
				{game.value.Status != undefined && (
					<div>
						<strong class="mr-2">Status</strong>
						{game.value.Status}
					</div>
				)}
				<div>
					<strong class="mr-2">Moves</strong>
					{moves.value}
				</div>
				<div>
					<strong class="mr-2">Time</strong>
					{clock.formatted}
				</div>
				<div>
					<Link href="/klondike/scores">Top Scores</Link>
				</div>
			</div>
			<div class="flex flex-wrap justify-between mb-4">
				<div class="flex flex-wrap">
					<div id="stock" class="card-container mr-4" onClick$={resetStock}>
						{util['stock'].map((card, index) => (
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
					<div id="waste" class="card-container mr-4">
						{util['waste'].map((card, index) => (
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
				</div>
				<div class="flex flex-wrap">
					<div
						id="aces-0"
						class="card-container ml-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{aces['aces-0'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={noop}
								from="aces-0"
							/>
						))}
					</div>
					<div
						id="aces-1"
						class="card-container ml-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{aces['aces-1'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={noop}
								from="aces-1"
							/>
						))}
					</div>
					<div
						id="aces-2"
						class="card-container ml-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{aces['aces-2'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={noop}
								from="aces-2"
							/>
						))}
					</div>
					<div
						id="aces-3"
						class="card-container ml-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{aces['aces-3'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={noop}
								from="aces-3"
							/>
						))}
					</div>
				</div>
			</div>
			<div class="flex flex-wrap justify-between mb-4">
				<div
					id="tableau-0"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-0'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-0"
						/>
					))}
				</div>
				<div
					id="tableau-1"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-1'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-1"
						/>
					))}
				</div>
				<div
					id="tableau-2"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-2'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-2"
						/>
					))}
				</div>
				<div
					id="tableau-3"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-3'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-3"
						/>
					))}
				</div>
				<div
					id="tableau-4"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-4'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-4"
						/>
					))}
				</div>
				<div
					id="tableau-5"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-5'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-5"
						/>
					))}
				</div>
				<div
					id="tableau-6"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-6'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-6"
						/>
					))}
				</div>
			</div>
		</div>
	)
})

export const head: DocumentHead = {
	title: 'Games by Jeff Rossi | Klondike',
	meta: [
		{
			name: 'description',
			content: 'Games by Jeff Rossi',
		},
	],
}
