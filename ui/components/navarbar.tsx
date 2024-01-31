import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRef } from "react"

import { GetNotifications, Notification } from '../apis/get_notifications';
import { GetOutfit, Outfit } from '../apis/get_outfits';
import { GetUsernameAndNotifications, UserNotifResp } from '../apis/get_user';
import { HamburgerMenuIcon } from './icons/menu-burger';
import { NotificationEmptyIcon } from './icons/notification-empty';
import { NotificationFilledIcon } from './icons/notification-filled';
import { CreateAccount } from './modals/createaccount';
import { SignIn } from './modals/signin';
import { OutfitModal } from './outfit-modal';

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


export function Navbar(props: { clientServer: string; cookie: string; user?: string; userNotifs?: UserNotifResp }) {
	const router = useRouter();

	const mobileMenuRef = useRef(null);

	const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

	const [showCreateAccountModal, setShowCreateAccountModal] =
		useState<boolean>(false);

	const [username, setUsername] = useState<string>(
		props.userNotifs ? props.userNotifs.username : ""
	);

	const [hasNotifs, setHasNotifs] = useState<boolean>(props.userNotifs ? props.userNotifs.has_notifications : false)

	const [useMobileMenu, setUseMobileMenu] = useState(false)

	const [displayMobileMenu, setDisplayMobileMenu] = useState(false);

	const [outfit, setOutfit] = useState<Outfit | null>(null);


	const checkMobileScreenWidth = (window: any) => {
		// const { innerWidth: width, innerHeight: height } = window;
		if (window.innerWidth <= 600) {
			setUseMobileMenu(true)
			return
		}

		setUseMobileMenu(false)
		setDisplayMobileMenu(false)
	}

	const handleOutsideClick = (event: any) => {
		if (
			mobileMenuRef.current &&
			!mobileMenuRef.current.contains(event.target)
		) {
			setDisplayMobileMenu(false)
		}
	};

	useEffect(() => {
		async function getusernotif() {
			const resp = await GetUsernameAndNotifications(props.clientServer, props.cookie)
			if (!(resp instanceof Error)) {
				setUsername(resp.username);
				setHasNotifs(resp.has_notifications);
				return;
			} else {
				// delete cookie if there was an error retreiving user info
				document.cookie = "rys-login=;expires=Thu, 01 Jan 1970 00:00:01 GMT"
			}
		}

		if (props.cookie && !username) {
			getusernotif();
		}

		checkMobileScreenWidth(window);
		window.addEventListener('resize', () => { checkMobileScreenWidth(window) });

		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, []);

	useEffect(() => {
		async function getoutfit(id: string) {
			const resp = await GetOutfit(props.clientServer, id)
			if (!(resp instanceof Error)) {
				setOutfit(resp)
			}
		}

		let outfit = router.query.outfit

		if (outfit && outfit.length > 0 && typeof outfit === 'string') {
			getoutfit(outfit);
		}

	}, [router])

	

	return (
		<>
			<div className="mb-20 shadow-sm px-4 md:px-8 py-2  top-0 w-screen bg-white fixed z-50 text-xs text-primary" style={{ fontFamily: 'custom-serif' }}>
				<div className="flex items-center gap-2 justify-between">
					{
						useMobileMenu ?
							<div
								className="hover:cursor-pointer"
								onClick={() => setDisplayMobileMenu(!displayMobileMenu)}>
								<HamburgerMenuIcon />
							</div> :
							<div className="mb-1">
								<Link href="/" passHref={true}>
									<a className="text-lg">RateYourStyle</a>
								</Link>
							</div>
					}
					{username ? (
						<UserAndNotification
							clientServer={props.clientServer}
							cookie={props.cookie}
							hasNotifs={hasNotifs}
							username={username}
						/>
					) : (
						<div className="flex flex-row gap-2 items-center">
							<button className="mr-2 w-fit" onClick={() => setShowSignInModal(true)}>
								<a>Sign in</a>
							</button>

							<button
								className="px-1 bg-primary text-white rounded-lg"
								onClick={() => setShowCreateAccountModal(true)}
							>
								Create Account
							</button>
						</div>
					)}
				</div>

				{!useMobileMenu &&
					<div className="">
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
				}
			</div>
			{displayMobileMenu &&
				<div className="bg-white shadow-xl border-t-2 border-background rounded w-fit z-50 px-4 pt-4 pb-8 h-full fixed top-8 left-0 flex flex-col gap-4 text-md" style={{ fontFamily: 'custom-serif' }} ref={mobileMenuRef}>
					<Link href="/" passHref={true}>
						<a className="">Home</a>
					</Link>

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
					handleClose={() => setShowCreateAccountModal(false)}
				/>
			)}

			{
				outfit &&
				<OutfitModal
					clientServer={props.clientServer}
					cookie={props.cookie} handleClose={() => {
						let url = window.location.origin + window.location.pathname
						window.location.href = url

					}} data={outfit}
					asUser={false} userRating={null}
				/>
			}
		</>
	)
}


function NotificationMenu(props: { clientServer: string; cookie: string; handleClose: any, notifications: Notification[] }) {
	const menuRef = useRef(null);

	useEffect(() => {
		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, []);

	const handleOutsideClick = (event: any) => {
		if (
			menuRef.current &&
			!menuRef.current.contains(event.target)
		) {
			props.handleClose()
		}
	};

	return (
		<div className="bg-white border-t-2 border-background rounded-md w-1/2 md:w-1/3 z-50 overflow-scroll fixed top-8 sm:top-12 right-4 flex flex-col  shadow-xl text-lg max-h-screen" style={{ fontFamily: 'custom-serif' }} ref={menuRef}>
			{props.notifications.length < 1 ?
				<div className="text-background-2 text-xs p-2">
					no notifications to show
				</div> :
				props.notifications.map((n) => (
					<button className="px-2 py-3 hover:bg-background text-left overflow-clip shrink-0" onClick={() => {
						let url = window.location.href;
						url += `?outfit=${n.for_outfit_id}`
						window.location.href = url;
					}}
						key={n.id}
					>
						<div className="text-background-2 text-xs">
							{n.date}
						</div>
						<div className="text-xs">
							{n.message}
						</div>
					</button>
				))
			}
		</div>
	)
}

function UserMenu(props: { username: string, handleClose: any }) {
	const menuRef = useRef(null);

	useEffect(() => {
		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, []);

	const handleOutsideClick = (event: any) => {
		if (
			menuRef.current &&
			!menuRef.current.contains(event.target)
		) {
			props.handleClose()
		}
	};

	return (
		<div className="bg-white border-t-2 border-background rounded-md z-50 overflow-scroll fixed top-8 sm:top-10 right-2 flex flex-col  shadow-xl text-lg max-h-screen" style={{ fontFamily: 'custom-serif' }} ref={menuRef}>
			<Link href={`/user/${props.username}`} passHref={true}>
				<button className="px-8 py-2  hover:bg-background text-left overflow-clip shrink-0 text-xs"
				>
					Account
				</button>
			</Link>
			<button className="px-8 py-2  hover:bg-background text-left overflow-clip shrink-0 text-xs" onClick={() => {
				// delete cookie
				document.cookie = "rys-login=;expires=Thu, 01 Jan 1970 00:00:01 GMT"
				// route back to home
				window.location.href = "/"
			}}
			>
				Logout
			</button>
		</div>
	)
}


function UserAndNotification(props: { clientServer: string; cookie: string; username: string; hasNotifs: boolean }) {
	const [displayNotifMenu, setDisplayNotifMenu] = useState(false);

	const [displayUserMenu, setDisplayUserMenu] = useState(false);

	const [notifs, setNotifs] = useState<Notification[]>([]);


	useEffect(() => {
		async function getnotifs() {
			const resp = await GetNotifications(props.clientServer, props.cookie)
			if (!(resp instanceof Error)) {
				setNotifs(resp)
			}
		}

		if (displayNotifMenu) {
			getnotifs()
		}

	}, [displayNotifMenu])

	return (
		<div className="flex flex-row gap-2 items-center">
			<button className="hover:text-black" onClick={() => { setDisplayNotifMenu(!displayNotifMenu) }}>
				{props.hasNotifs ? <NotificationFilledIcon /> :
					<NotificationEmptyIcon />
				}
			</button>
			<button className="text-primary hover:text-black" onClick={() => { setDisplayUserMenu(!displayUserMenu) }}>
				{props.username}
			</button>

			{displayNotifMenu &&

				<NotificationMenu
					handleClose={() => { setDisplayNotifMenu(false) }}
					notifications={notifs}
					clientServer={props.clientServer}
					cookie={props.cookie}

				/>

			}
			{displayUserMenu &&
				<UserMenu username={props.username} handleClose={()=>setDisplayUserMenu(false)} />
			}
		</div>

	)
}

