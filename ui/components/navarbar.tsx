import { useEffect, useState } from 'react';
import Link from 'next/link'

import { GetCookie } from '../apis/get_cookie';
import { GetUsername } from '../apis/get_user';
import { CreateAccount } from './modals/createaccount';
import { SignIn } from './modals/signin';
import { HamburgerMenuIcon } from './icons/menu-burger';

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
	const [useMobileMenu, setUseMobileMenu] = useState(false)
	const [displayMobileMenu, setDisplayMobileMenu] = useState(false);

	const checkMobileScreenWidth = (window: any) => {
		// const { innerWidth: width, innerHeight: height } = window;
		if (window.innerWidth <= 600) {
			setUseMobileMenu(true)
			return
		}

		setUseMobileMenu(false)
	}

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

		checkMobileScreenWidth(window);
		window.addEventListener('resize', () => { checkMobileScreenWidth(window) });
	}, []);

	if (useMobileMenu) {
		return (
			<>
				<div className="mb-20 shadow-sm px-4 md:px-8 py-2  top-0 w-screen bg-white fixed z-50 text-xs text-primary flex items-center gap-2 justify-between" style={{ fontFamily: 'custom-serif' }}>

					<div className="flex flex-row gap-2">
						<div className="hover:cursor-pointer" onClick={() => setDisplayMobileMenu(!displayMobileMenu)}><HamburgerMenuIcon /></div>
						<Link href="/" passHref={true}>
							<a className="text-base">RateYourStyle</a>
						</Link>
					</div>



					{username ? (
						<>
							<Link href={`/user/${username}`} passHref={true}><a>{username}</a></Link>
						</>
					) : (
						<div className="flex flex-row gap-2 items-center">
							<button className="mr-2 w-fit" onClick={() => setShowSignInModal(true)}>
								<a>Sign in</a>
							</button>

							<button
								className="px-1 bg-primary text-white rounded-lg"
								onClick={() => setShowCreateAccountModal(true)}
							>
								Create <br />Account
							</button>
						</div>
					)}

				</div>

				{displayMobileMenu &&
					<div className="bg-background w-fit z-50 px-4 pb-8 h-full fixed top-8 left-0 flex flex-col gap-2 shadow text-lg" style={{ fontFamily: 'custom-serif' }}>
						<div onClick={() => setDisplayMobileMenu(false)} className="self-end mt-4 hover:cursor-pointer">
							&#10006;
						</div>

						<Link href="/discover" passHref={true}>
							<a className="">Discover</a>
						</Link>

						<Link href="/post-outfit" passHref={true}>
							Post Outfit
						</Link>

						<Link href="/request-closet" passHref={true}>
							Request Closet
						</Link>

						<Link href="/for-businesses" passHref={true}>
							For Businesses
						</Link>

						{/* {username ? (
							<>
								<Link href={`/user/${username}`} passHref={true}><a>{username}</a></Link>
							</>
						) : (
							<>
								<button className="mr-2 w-fit" onClick={() => setShowSignInModal(true)}>
									<a>Sign in</a>
								</button>

								<button
									className="px-1 bg-primary text-white rounded-lg w-fit"
									onClick={() => setShowCreateAccountModal(true)}
								>
									Create Account
								</button>
							</>
						)} */}

					</div>
				}

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
		)
	}

	return (
		<>
			<div className="mb-20 shadow-sm px-4 md:px-8 py-2   top-0 w-screen bg-white fixed z-50 text-xs text-primary" style={{ fontFamily: 'custom-serif' }}>
				<div className="mb-1">
					<Link href="/" passHref={true}>
						<a className="text-lg">RateYourStyle</a>
					</Link>
					<div className="float-right">
						{username ? (
							<>
								<Link href={`/user/${username}`} passHref={true}><a>{username}</a></Link>
							</>
						) : (
							<>
								<button className="mr-2" onClick={() => setShowSignInModal(true)}>
									<a>Sign in</a>
								</button>

								<button
									className="px-1 bg-primary text-white rounded-lg"
									onClick={() => setShowCreateAccountModal(true)}
								>
									Create Account
								</button>
							</>
						)}
					</div>
				</div>
				<Link href="/discover" passHref={true}>
					<a className="">Discover</a>
				</Link>
				<span className="mx-1">|</span>
				<Link href="/post-outfit" passHref={true}>
					Post Outfit
				</Link>
				<span className="mx-1">|</span>
				<Link href="/request-closet" passHref={true}>
					Request Closet
				</Link>
				<span className="mx-1">|</span>
				<Link href="/for-businesses" passHref={true}>
					For Businesses
				</Link>
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
