import { useEffect, useState } from 'react';
import Link from 'next/link'

import { GetCookie } from '../apis/get_cookie';
import { GetUsername } from '../apis/get_user';
import { CreateAccount } from './modals/createaccount';
import { SignIn } from './modals/signin';
import { GetServerURL } from '../apis/get_server';

export function Navbar(props: { cookie: string; user?: string }) {
	const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
	const [showCreateAccountModal, setShowCreateAccountModal] =
		useState<boolean>(false);
	const [showPostOutfitModal, setShowPostOutfitModal] =
		useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState<string>(
		props.user ? props.user : ""
	);

	const server = GetServerURL(true);

	useEffect(() => {
		async function getcookie() {
			const resp = await GetCookie(server);
			if (resp instanceof Error) {
				setError(resp.message);
				return;
			}

			// set cookie in browser
			document.cookie = resp;
			location.reload();
		}

		async function getusername() {
			const resp = await GetUsername(server, props.cookie);
			if (!(resp instanceof Error)) {
				setUsername(resp);
				return;
			}
		}

		if (!props.cookie) {
			getcookie();
		} else {
			!username && getusername();
		}
	}, []);

	return (
		<>
			<div className="mb-20 shadow-md px-4 py-2  top-0 w-screen bg-white flex flex-wrap items-center justify-between fixed">
				<div>
					<Link href="/" >
						<a className="mx-2">Home</a>
					</Link>
					<Link href="/campaigns">
						<a className="mx-2">Gift Cards</a>
					</Link>
					<Link href="/post-outfit">
						Post an Outfit
					</Link>
				</div>
				<div className="float-right">
					{username ? (
						<>
							<Link href={`/user/${username}`}>{username}</Link>
						</>
					) : (
						<>
							<button className="mx-2" onClick={() => setShowSignInModal(true)}>
								Sign in
							</button>

							<button
								className="p-2 bg-pink rounded-lg"
								onClick={() => setShowCreateAccountModal(true)}
							>
								Create Account
							</button>
						</>
					)}
				</div>
			</div>
			{showSignInModal && (
				<SignIn handleClose={() => setShowSignInModal(false)} />
			)}
			{showCreateAccountModal && (
				<CreateAccount
					cookie={props.cookie}
					handleClose={() => setShowCreateAccountModal(false)}
				/>
			)}
		</>
	);
}
