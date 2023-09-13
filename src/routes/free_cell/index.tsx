import {
	component$,
	useStore,
	$,
	noSerialize,
	type QwikDragEvent,
	useSignal,
	type NoSerialize,
} from '@builder.io/qwik'
import { Link } from '@builder.io/qwik-city'
import type { CardContainerType } from '../../types/card-container.type'
import { Deck } from '../../lib/deck.class'
import { PlayingCard } from '../../components/playing-card/playing-card'
import type { Card } from '../../lib/card.class'
import type { FreeCell } from '../../types/free-cell.type'
import { GameStatus } from '../../enum/game-status.enum'
import { RestClient } from '../../lib/rest-client'

export default component$(() => {
	const game = useSignal<FreeCell>({})
	const tableau = useStore<CardContainerType>({
		'tableau-0': [],
		'tableau-1': [],
		'tableau-2': [],
		'tableau-3': [],
		'tableau-4': [],
		'tableau-5': [],
		'tableau-6': [],
		'tableau-7': [],
	})
	const aces = useStore<CardContainerType>({
		'aces-0': [],
		'aces-1': [],
		'aces-2': [],
		'aces-3': [],
	})
	const free = useStore<CardContainerType>({
		'free-0': [],
		'free-1': [],
		'free-2': [],
		'free-3': [],
	})
	const dragging = useSignal('')
	const playing = useSignal(false)
	const canAutoComplete = useSignal(false)
	const moves = useSignal(0)

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

	const getAceCount = $(() => {
		let aceCount = 0
		for (const key in aces) {
			aceCount += aces[key].length
		}
		return aceCount
	})

	const clearCardContainers = $(() => {
		for (let i = 0; i < 4; i++) {
			aces[`aces-${i}`] = []
			free[`free-${i}`] = []
		}
		for (let i = 0; i < 8; i++) tableau[`tableau-${i}`] = []
	})

	const updateGame = $(async (Status: GameStatus) => {
		if (!game.value.id) return
		const { elapsed: Elapsed } = clock
		const Moves = moves.value
		const client = new RestClient()
		const req = await client.patch({
			path: `api/free_cell/${game.value.id}`,
			payload: { Status, Elapsed, Moves },
		})
		if (req.ok) game.value = await req.json()
	})

	const quit = $(() => {
		clearCardContainers()
		stopClock()
		updateGame(GameStatus.Lost)
		playing.value = false
	})

	const adjustDraggable = $(async () => {
		console.log('adjustDraggable')
		const deck = new Deck()
		let current: Card | undefined, previous: Card | undefined, length: number
		const temp: CardContainerType = {}
		let allDescending = true
		for (const key in tableau) {
			length = tableau[key].length
			temp[key] = []
			if (length) {
				for (let i = 0; i < length; i++) {
					const card = tableau[key][i]
					if (card) card.draggable = false
				}
				previous = undefined
				while (tableau[key].length) {
					current = tableau[key].pop()
					if (current) {
						if (!previous) current.draggable = true
						if (
							previous &&
							deck.color(previous) != deck.color(current) &&
							deck.faces.indexOf(current.face) ==
								deck.faces.indexOf(previous.face) + 1
						)
							current.draggable = true
						if (
							previous &&
							deck.faces.indexOf(previous.face) >=
								deck.faces.indexOf(current.face)
						)
							allDescending = false
						temp[key].unshift(noSerialize(current))
						previous = current
					}
				}
			}
			setTimeout(() => {
				tableau[key] = temp[key]
			}, 0)
		}
		const aceCount = await getAceCount()
		canAutoComplete.value = allDescending && aceCount < 52
		if (aceCount == 52) {
			stopClock()
			clearCardContainers()
			updateGame(GameStatus.Won)
		}
	})

	const createGame = $(async () => {
		const client = new RestClient()
		const req = await client.post({ path: 'api/free_cell', payload: {} })
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

		let counter = 0
		while (deck.cards.length) {
			const card = deck.draw()
			if (card) {
				card.facedown = false
				tableau[`tableau-${counter}`].push(noSerialize(card))
				counter++
				if (counter >= 8) counter = 0
			}
		}
		playing.value = true
		moves.value = 0
		createGame()
		adjustDraggable()
	})

	const noop = $(() => {})

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
			case 'free-0':
			case 'free-1':
			case 'free-2':
			case 'free-3':
				idx = free[from].findIndex((c) => c && c.id == cardId)
				card = free[from][idx]
				quantity = idx != -1 ? free[from].length - idx : 0
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

	const maxFreeSpace = $(() => {
		let emptyFree = 0
		let emptyTableau = 0
		for (const key in free) {
			if (!free[key].length) emptyFree++
		}
		for (const key in tableau) {
			if (!tableau[key].length) emptyTableau++
		}
		return emptyTableau * emptyFree + emptyFree + 1
	})

	const canDrop = $(
		(
			to: string,
			quanity: number,
			max: number,
			draggedCard: NoSerialize<Card> | undefined,
			topCard: NoSerialize<Card> | undefined
		) => {
			const deck = new Deck()
			if (quanity > max) return false
			if (!draggedCard) return false
			switch (to) {
				case 'tableau-0':
				case 'tableau-1':
				case 'tableau-2':
				case 'tableau-3':
				case 'tableau-4':
				case 'tableau-5':
				case 'tableau-6':
				case 'tableau-7':
					if (topCard && deck.color(topCard) == deck.color(draggedCard)) {
						return false
					}
					if (
						topCard &&
						deck.faces.indexOf(topCard.face) !=
							deck.faces.indexOf(draggedCard.face) + 1
					) {
						return false
					}
					break
				case 'free-0':
				case 'free-1':
				case 'free-2':
				case 'free-3':
					if (topCard || quanity > 1) return false
					break
				case 'aces-0':
				case 'aces-1':
				case 'aces-2':
				case 'aces-3':
					if (quanity > 1) {
						return false
					}
					if (topCard == undefined && draggedCard.face != 'ace') {
						return false
					}
					if (topCard && topCard.suit != draggedCard.suit) {
						return false
					}
					if (
						topCard &&
						deck.faces.indexOf(draggedCard.face) !=
							deck.faces.indexOf(topCard.face) + 1
					) {
						return false
					}
					break
			}
			return true
		}
	)

	const moveCards = $((from: string, to: string, cardId: number) => {
		const toMove: Card[] = []
		let found = false
		switch (from) {
			case 'free-0':
			case 'free-1':
			case 'free-2':
			case 'free-3':
				while (!found) {
					const card = free[from].pop()
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
						if (card.id == cardId) found = true
					}
				}
				break
		}
		switch (to) {
			case 'free-0':
			case 'free-1':
			case 'free-2':
			case 'free-3':
				while (toMove.length) {
					const card = toMove.pop()
					if (card) {
						free[to].push(noSerialize(card))
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
				while (toMove.length) {
					const card = toMove.pop()
					if (card) {
						tableau[to].push(noSerialize(card))
					}
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
		adjustDraggable()
	})

	const getAutoMoveCard = $(() => {
		const deck = new Deck()
		let lowestCard: Card | undefined,
			topCard: Card | undefined,
			topAce: Card | undefined,
			from: string | undefined,
			to: string | undefined,
			length: number
		for (const key in free) {
			length = free[key].length
			if (length) {
				topCard = free[key][length - 1]
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
					)
						to = key
				} else if (lowestCard.face == 'ace') {
					to = key
				}
			}
		}
		return { from, to }
	})

	const autoMoveCard = $((from: string, to: string) => {
		let card: Card | undefined
		switch (from) {
			case 'free-0':
			case 'free-1':
			case 'free-2':
			case 'free-3':
				card = free[from].pop()
				if (card) aces[to].push(noSerialize(card))
				break
			case 'tableau-0':
			case 'tableau-1':
			case 'tableau-2':
			case 'tableau-3':
			case 'tableau-4':
			case 'tableau-5':
			case 'tableau-6':
			case 'tableau-7':
				card = tableau[from].pop()
				if (card) aces[to].push(noSerialize(card))
				break
		}
		moves.value++
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
		adjustDraggable()
	})

	const onDrop = $(
		async (_: QwikDragEvent<HTMLDivElement>, target: HTMLDivElement) => {
			const to = target.id
			const topCard = await getTopCard(to)
			const { card: draggedCard, quantity } = await getDraggedCard()
			const max = await maxFreeSpace()
			const drop = await canDrop(to, quantity, max, draggedCard, topCard)
			if (!drop || !draggedCard) return
			const from = dragging.value.split('_')[0]
			moveCards(from, to, draggedCard.id)
		}
	)

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
					<Link href="/free_cell/scores">Top Scores</Link>
				</div>
			</div>
			<div class="flex flex-wrap justify-between mb-4">
				<div class="flex flex-wrap">
					<div
						id="free-0"
						class="card-container mr-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{free['free-0'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={onDragStart}
								from="free-0"
							/>
						))}
					</div>
					<div
						id="free-1"
						class="card-container mr-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{free['free-1'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={onDragStart}
								from="free-1"
							/>
						))}
					</div>
					<div
						id="free-2"
						class="card-container mr-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{free['free-2'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={onDragStart}
								from="free-2"
							/>
						))}
					</div>
					<div
						id="free-3"
						class="card-container mr-4"
						onDrop$={onDrop}
						preventdefault:dragover
					>
						{free['free-3'].map((card, index) => (
							<PlayingCard
								key={card ? card.id : index}
								card={card}
								index={index}
								level={0}
								onClick={noop}
								onDragStart={onDragStart}
								from="free-3"
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
				<div
					id="tableau-7"
					class="card-container"
					onDrop$={onDrop}
					preventdefault:dragover
				>
					{tableau['tableau-7'].map((card, index) => (
						<PlayingCard
							key={card ? card.id : index}
							card={card}
							index={index}
							level={index}
							onClick={noop}
							onDragStart={onDragStart}
							from="tableau-7"
						/>
					))}
				</div>
			</div>
		</div>
	)
})
