import { useEffect, useState } from 'react';

import { GetCookie } from '../apis/get_cookie';
import { GetUsername } from '../apis/get_user';
import { CreateAccount } from './modals/createaccount';
import { SignIn } from './modals/signin';
import { GetServerURL } from '../apis/get_server';

export function Navbar(props: {cookie: string; user?: string}) {
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
					<a href="/" className="mx-2">
						Home
					</a>
					<a href="/campaigns" className="mx-2">
						Campaigns
					</a>
					<a href="/post-outfit" className="">
						Post an Outfit
					</a>
				</div>
				<div className="float-right">
					{username ? (
						<>
							<a href={`/user/${username}`}>{username}</a>
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
			{/* {showPostOutfitModal && (
				<PostOutfit
					cookie={props.cookie}
					handleClose={() => setShowPostOutfitModal(false)}
				/>
			)} */}
		</>
	);
}
