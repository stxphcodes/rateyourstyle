import { useEffect, useState } from 'react';
import Link from 'next/link'

import { GetCookie } from '../apis/get_cookie';
import { GetUsername } from '../apis/get_user';
import { CreateAccount } from './modals/createaccount';
import { SignIn } from './modals/signin';
import { GetServerURL } from '../apis/get_server';

// check if browser allows cookies to be set
function cookieEnabled() {
	var inOneMinute = new Date(new Date().getTime() + 60 * 1000);
	document.cookie =
		"rys-test=testcookie; expires=" + inOneMinute.toISOString() + ";";
	var enabled = document.cookie.indexOf("rys-test") != -1;

	// delete test cookie
	document.cookie = "rys-test=; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

	return enabled
}

export function Navbar(props: { clientServer: string; cookie: string; user?: string }) {
	const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
	const [showCreateAccountModal, setShowCreateAccountModal] =
		useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState<string>(
		props.user ? props.user : ""
	);

	useEffect(() => {
		async function getcookie() {
			const resp = await GetCookie(props.clientServer);
			if (resp instanceof Error) {
				setError(resp.message);
				return;
			}

			// set cookie in browser
			document.cookie = resp;
			location.reload();
		}

		async function getusername() {
			const resp = await GetUsername(props.clientServer, props.cookie);
			if (!(resp instanceof Error)) {
				setUsername(resp);
				return;
			}
		}

		if (!props.cookie) {
			if (cookieEnabled()) {
				getcookie();
			}
		} else {
			!username && getusername();
		}
	}, []);

	return (
		<>
			<div className="mb-20 shadow-sm px-3 py-2 md:py-4  top-0 w-screen bg-white flex flex-wrap items-center justify-between fixed">
				<div>
					<Link href="/" >
						<a className="mr-2 md:ml-4">Home</a>
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
							<Link href={`/user/${username}`}><a>{username}</a></Link>
						</>
					) : (
						<>
							<button className="mx-2" onClick={() => setShowSignInModal(true)}>
								<a>Sign in</a>
							</button>

							<button
								className="p-2 bg-primary text-white rounded-lg"
								onClick={() => setShowCreateAccountModal(true)}
							>
								Create Account
							</button>
						</>
					)}
				</div>
			</div>
			{showSignInModal && (
				<SignIn
					handleClose={() => setShowSignInModal(false)} clientServer={props.clientServer}
				/>
			)}
			{showCreateAccountModal && (
				<CreateAccount
					clientServer={props.clientServer}
					cookie={props.cookie}
					handleClose={() => setShowCreateAccountModal(false)}
				/>
			)}
		</>
	);
}
