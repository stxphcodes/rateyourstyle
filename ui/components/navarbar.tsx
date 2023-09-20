import { useState } from "react";
import { useEffect } from "react";
import { SignIn } from "./modals/signin";
import { CreateAccount } from "./modals/createaccount";
import { GetUsername } from "../apis/get_user";
import { PostOutfit } from "./modals/postoutfit";

export function Navbar(props: { cookie: string }) {
	const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
	const [showCreateAccountModal, setShowCreateAccountModal] = useState<boolean>(false);
	const [showPostOutfitModal, setShowPostOutfitModal] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		if (!props.cookie) {
			return
		}

		async function fetchData() {
			const resp = await GetUsername(props.cookie)
			if (resp instanceof Error) {
				setError(resp.message)
				return
			}

			setUsername(resp)
		}

		fetchData()
	},
		[])

	return (
		<div className="">
			<a href="/" className="">Home</a>
			
			<div className="float-right">
				{
					props.cookie && error ?
						<div>Error userinfo </div> :
						username ? <>
							<button
								onClick={() => setShowPostOutfitModal(true)} className="mx-2">
								Post an Outfit
							</button>
							<a href="/">{username}</a>

						</> :
							<>
								<button
									className="mx-2"
									onClick={() => setShowSignInModal(true)}>Sign in
								</button>

								<button
									className="p-2 bg-pink rounded-lg"
									onClick={() => setShowCreateAccountModal(true)}>Create Account
								</button>
							</>
				}
			</div>
			{
				showSignInModal &&
				<SignIn handleClose={() => setShowSignInModal(false)} />
			}
			{
				showCreateAccountModal &&
				<CreateAccount handleClose={() => setShowCreateAccountModal(false)} />
			}
			{
				showPostOutfitModal && <PostOutfit cookie={props.cookie} handleClose={() => setShowPostOutfitModal(false)} />
			}
		</div>
	)
}