import { component$, useStore, $, type QwikChangeEvent } from '@builder.io/qwik'
import { Navigation } from '../navigation/navigation'
import {
	type SessionData,
	blankSession,
	sessionKey,
} from '../../types/session-data.type'
import type { ArgsUserCredential } from '../../types/args-user-credential.type'
import { RestClient } from '../../lib/rest-client'

export interface HeaderBarProps {}

export const HeaderBar = component$<HeaderBarProps>(() => {
	const sesssion = useStore<SessionData>(blankSession)
	const credentials = useStore<ArgsUserCredential>({
		UserName: '',
		password: '',
	})

	const signInDialog = $(() => {
		const overlay = document.getElementById('auth-overlay')
		const dialog = document.getElementById('sign-in-dialog')
		if (overlay && dialog) {
			overlay.style.display = 'block'
			dialog.style.display = 'block'
		}
	})

	const closeSignIn = $(() => {
		const overlay = document.getElementById('auth-overlay')
		const dialog = document.getElementById('sign-in-dialog')
		if (overlay && dialog) {
			overlay.style.display = 'none'
			dialog.style.display = 'none'
		}
	})

	const signIn = $(async () => {
		const client = new RestClient()
		const { UserName, password } = credentials
		const req = await client.post({
			path: 'api/auth/login',
			payload: { UserName, password },
		})
		if (req.ok) {
			const { Token } = await req.json()
			sesssion.UserName = UserName
			sesssion.Token = Token
			sesssion.SignedIn = true
			sessionStorage.setItem(
				sessionKey,
				JSON.stringify({ UserName, Token, SignedIn: true })
			)
			closeSignIn()
		}
	})

	const registerDialog = $(() => {
		const overlay = document.getElementById('auth-overlay')
		const dialog = document.getElementById('register-dialog')
		if (overlay && dialog) {
			overlay.style.display = 'block'
			dialog.style.display = 'block'
		}
	})

	const closeRegister = $(() => {
		const overlay = document.getElementById('auth-overlay')
		const dialog = document.getElementById('register-dialog')
		if (overlay && dialog) {
			overlay.style.display = 'none'
			dialog.style.display = 'none'
		}
	})

	const register = $(async () => {
		const client = new RestClient()
		const { UserName, password } = credentials
		const req = await client.post({
			path: 'api/auth/register',
			payload: { UserName, password },
		})
		if (req.ok) {
			signIn()
			closeRegister()
		}
	})

	const signOut = $(() => {
		sessionStorage.removeItem(sessionKey)
		sesssion.Token = null
		sesssion.UserName = null
		sesssion.SignedIn = false
	})

	const inputChanged = $((e: QwikChangeEvent<HTMLInputElement>) => {
		switch (e.target.name) {
			case 'UserName':
				credentials.UserName = e.target.value
				break
			case 'password':
				credentials.password = e.target.value
				break
		}
	})

	return (
		<div class="m-2">
			<div class="flex flex-wrap justify-between mb-2">
				<h1>Games by Jeff Rossi</h1>
				{sesssion.SignedIn ? (
					<div class="flex flex-wrap">
						<div class="font-bold">{sesssion.UserName}</div>
						<button class="ml-2" onClick$={signOut}>
							Sign Out
						</button>
					</div>
				) : (
					<div class="flex flex-wrap">
						<button class="ml-2" onClick$={signInDialog}>
							Sign In
						</button>
						<button class="ml-2" onClick$={registerDialog}>
							Register
						</button>
					</div>
				)}
			</div>
			<Navigation />
			<div id="auth-overlay" class="modal-overlay">
				<div id="register-dialog" class="dialog-30p">
					<h1>Register</h1>
					<form onSubmit$={() => false}>
						<div class="mb-2">
							<label for="UserName" class="block">
								User Name
							</label>
							<input
								type="text"
								name="UserName"
								id="register-UserName"
								onChange$={inputChanged}
							/>
						</div>
						<div class="mb-2">
							<label for="password" class="block">
								Password
							</label>
							<input
								type="password"
								name="password"
								id="register-password"
								onChange$={inputChanged}
							/>
						</div>
					</form>
					<div class="flex justify-between">
						<button onClick$={closeRegister}>Cancel</button>
						<button onClick$={register}>Register</button>
					</div>
				</div>
				<div id="sign-in-dialog" class="dialog-30p">
					<h1>Sign In</h1>
					<form onSubmit$={() => false}>
						<div class="mb-2">
							<label for="UserName" class="block">
								User Name
							</label>
							<input
								type="text"
								name="UserName"
								id="sign-in-UserName"
								onChange$={inputChanged}
							/>
						</div>
						<div class="mb-2">
							<label for="password" class="block">
								Password
							</label>
							<input
								type="password"
								name="password"
								id="sign-in-password"
								onChange$={inputChanged}
							/>
						</div>
					</form>
					<div class="flex justify-between">
						<button onClick$={closeSignIn}>Cancel</button>
						<button onClick$={signIn}>Sign In</button>
					</div>
				</div>
			</div>
		</div>
	)
})
