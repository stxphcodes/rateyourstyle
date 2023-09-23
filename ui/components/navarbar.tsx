import {useEffect, useState} from 'react';

import {GetUsername} from '../apis/get_user';
import {CreateAccount} from './modals/createaccount';
import {PostOutfit} from './modals/postoutfit';
import {SignIn} from './modals/signin';

export function Navbar(props: {cookie: string}) {
	const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
	const [showCreateAccountModal, setShowCreateAccountModal] =
		useState<boolean>(false);
	const [showPostOutfitModal, setShowPostOutfitModal] =
		useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		if (!props.cookie) {
			return;
		}

		async function fetchData() {
			const resp = await GetUsername(props.cookie);
			if (resp instanceof Error) {
				setError(resp.message);
				return;
			}

			setUsername(resp);
		}

		fetchData();
	}, []);

	return (
		<>
			<div className="mb-20 shadow-md px-4 py-2 fixed top-0 w-screen bg-white flex flex-wrap items-center justify-between">
				<div>
					<a href="/" className="">
						Home
					</a>
					<button
						onClick={() => setShowPostOutfitModal(true)}
						className="mx-2"
					>
						Post an Outfit
					</button>
				</div>
				<div className="float-right">
					{username ? (
						<>
							<button
								onClick={() => setShowPostOutfitModal(true)}
								className="mx-2"
							>
								Post an Outfit
							</button>
							<a href="/">{username}</a>
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
				<CreateAccount handleClose={() => setShowCreateAccountModal(false)} />
			)}
			{showPostOutfitModal && (
				<PostOutfit
					cookie={props.cookie}
					handleClose={() => setShowPostOutfitModal(false)}
				/>
			)}
		</>
	);
}
