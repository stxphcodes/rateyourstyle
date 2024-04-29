import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRef } from "react";

import { GetNotifications, Notification } from "../apis/get_notifications";
import { GetOutfit, Outfit } from "../apis/get_outfits";
import { GetUsernameAndNotifications, UserNotifResp } from "../apis/get_user";
import { HamburgerMenuIcon } from "./icons/menu-burger";
import { NotificationEmptyIcon } from "./icons/notification-empty";
import { NotificationFilledIcon } from "./icons/notification-filled";
import { CreateAccount } from "./modals/createaccount";
import { SignIn } from "./modals/signin";
import { OutfitModal } from "./modals/outfit";

// check if browser allows cookies to be set
function cookieEnabled() {
  var inOneMinute = new Date(new Date().getTime() + 60 * 1000);
  document.cookie =
    "rys-test=testcookie; expires=" + inOneMinute.toISOString() + ";";
  var enabled = document.cookie.indexOf("rys-test") != -1;

  // delete test cookie
  document.cookie = "rys-test=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

  return enabled;
}

export function Navbar(props: {
  clientServer: string;
  cookie?: string;
  username?: string;
}) {
  const router = useRouter();

  const mobileMenuRef = useRef<any>();
  const mobileMenuButtonRef = useRef<any>();

  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);

  const [showCreateAccountModal, setShowCreateAccountModal] =
    useState<boolean>(false);

  const [hasNotifs, setHasNotifs] = useState<boolean>(false);

  const [user, setUser] = useState<string>(
    props.username ? props.username : ""
  );

  const [useMobileMenu, setUseMobileMenu] = useState(false);

  const [displayMobileMenu, setDisplayMobileMenu] = useState(false);

  const [outfit, setOutfit] = useState<Outfit | null>(null);

  const checkMobileScreenWidth = (window: any) => {
    if (window.innerWidth <= 600) {
      setUseMobileMenu(true);
      return;
    }

    setUseMobileMenu(false);
    setDisplayMobileMenu(false);
  };

  const handleOutsideClick = (event: any) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target)
    ) {
      setDisplayMobileMenu(false);
    }
  };

  useEffect(() => {
    async function getusernotif() {
      if (props.cookie) {
        const resp = await GetUsernameAndNotifications(
          props.clientServer,
          props.cookie
        );
        if (!(resp instanceof Error)) {
          setUser(resp.username);
          setHasNotifs(resp.has_notifications);
          return;
        } else {
          // delete cookie if there was an error retreiving user info
          document.cookie = "rys-login=;expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
      }
    }

    getusernotif();

    checkMobileScreenWidth(window);
    window.addEventListener("resize", () => {
      checkMobileScreenWidth(window);
    });

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    async function getoutfit(id: string) {
      const resp = await GetOutfit(props.clientServer, id);
      if (!(resp instanceof Error)) {
        setOutfit(resp);
      }
    }

    let outfit = router.query.outfit;

    if (outfit && outfit.length > 0 && typeof outfit === "string") {
      getoutfit(outfit);
    }
  }, [router]);

  return (
    <>
      <div className="mb-20 shadow-sm px-4 md:px-8 py-2  top-0 w-screen  bg-white fixed z-50 text-xs uppercase">
        <div className="flex items-center gap-2 justify-between">
          {useMobileMenu ? (
            <div
              ref={mobileMenuButtonRef}
              className="hover:cursor-pointer"
              onClick={() => setDisplayMobileMenu(!displayMobileMenu)}
            >
              <HamburgerMenuIcon />
            </div>
          ) : (
            <div className="mb-1">
              <Link href="/" passHref={true}>
                <a className="text-lg">Rate Your Style</a>
              </Link>
            </div>
          )}
          {user && props.cookie ? (
            <UserAndNotification
              clientServer={props.clientServer}
              cookie={props.cookie}
              hasNotifs={hasNotifs}
              username={user}
            />
          ) : (
            <div className="flex flex-row gap-2 items-center">
              <button
                className="mr-2 uppercase"
                onClick={() => setShowSignInModal(true)}
              >
                <a>Sign in</a>
              </button>

              <button
                className="px-1 bg-custom-lime font-bold rounded-lg uppercase"
                onClick={() => setShowCreateAccountModal(true)}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {!useMobileMenu && (
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
          </div>
        )}
      </div>
      {displayMobileMenu && (
        <div
          className="bg-white shadow-xl border-t-2 border-background rounded w-fit z-50 px-4 pt-4 pb-8 h-full fixed top-8 left-0 flex flex-col gap-4 text-md uppercase"
          ref={mobileMenuRef}
        >
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
        </div>
      )}

      {showSignInModal && (
        <SignIn
          handleClose={() => setShowSignInModal(false)}
          clientServer={props.clientServer}
        />
      )}
      {showCreateAccountModal && (
        <CreateAccount
          clientServer={props.clientServer}
          handleClose={() => setShowCreateAccountModal(false)}
        />
      )}

      {outfit && (
        <OutfitModal
          clientServer={props.clientServer}
          cookie={props.cookie}
          handleClose={() => {
            let url = window.location.origin + window.location.pathname;
            window.location.href = url;
          }}
          data={outfit}
          asUser={false}
          userRating={null}
        />
      )}
    </>
  );
}

function NotificationMenu(props: {
  clientServer: string;
  cookie: string;
  handleClose: any;
  notifications: Notification[];
}) {
  const menuRef = useRef<any>();

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event: any) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      props.handleClose();
    }
  };

  return (
    <div
      className="bg-white border-t-2 border-background rounded-md w-1/2 md:w-1/3 z-50 overflow-scroll fixed top-8 sm:top-12 right-4 flex flex-col  shadow-xl text-lg max-h-screen text-xs"
      ref={menuRef}
    >
      {props.notifications.length < 1 ? (
        <div className="p-2">no notifications to show</div>
      ) : (
        props.notifications.map((n) => (
          <button
            className="p-3 hover:bg-custom-tan text-left overflow-clip shrink-0"
            onClick={() => {
              let url = window.location.href;
              url += `?outfit=${n.for_outfit_id}`;
              window.location.href = url;
            }}
            key={n.id}
          >
            <div className="text-custom-grey-brown">{n.date}</div>
            <div className="">{n.message}</div>
          </button>
        ))
      )}
    </div>
  );
}

function UserMenu(props: { username: string; handleClose: any }) {
  const menuRef = useRef<any>();

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event: any) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      props.handleClose();
    }
  };

  return (
    <div
      className="bg-white border-t-2 border-background rounded-md z-50 overflow-scroll fixed top-8 sm:top-10 right-2 flex flex-col  shadow-xl text-lg max-h-screen"
      ref={menuRef}
    >
      <Link href={`/user/${props.username}`} passHref={true}>
        <button className="px-8 py-2  hover:bg-custom-tan text-left overflow-clip shrink-0 text-xs uppercase">
          Account
        </button>
      </Link>

      <Link href={`/requests/${props.username}`} passHref={true}>
        <button className="px-8 py-2  hover:bg-custom-tan text-left overflow-clip shrink-0 text-xs uppercase">
          Requests
        </button>
      </Link>

      <button
        className="px-8 py-2  hover:bg-custom-tan text-left overflow-clip shrink-0 text-xs uppercase"
        onClick={() => {
          // delete cookie
          document.cookie = "rys-login=;expires=Thu, 01 Jan 1970 00:00:01 GMT";
          // route back to home
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

function UserAndNotification(props: {
  clientServer: string;
  cookie: string;
  username: string;
  hasNotifs: boolean;
}) {
  const [displayNotifMenu, setDisplayNotifMenu] = useState(false);

  const [displayUserMenu, setDisplayUserMenu] = useState(false);

  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    async function getnotifs() {
      const resp = await GetNotifications(props.clientServer, props.cookie);
      if (!(resp instanceof Error)) {
        setNotifs(resp);
      }
    }

    if (displayNotifMenu) {
      getnotifs();
    }
  }, [displayNotifMenu]);

  return (
    <div className="flex flex-row gap-2 items-center">
      <button
        onClick={() => {
          setDisplayNotifMenu(!displayNotifMenu);
        }}
      >
        {props.hasNotifs ? (
          <div className="flex">
            <div className="animate-pulse">
              <NotificationFilledIcon />
            </div>
            <div
              className="animate-ping rounded-full "
              style={{ background: "#d8e303", width: "0.6em", height: "0.6em" }}
            ></div>
          </div>
        ) : (
          <NotificationEmptyIcon />
        )}
      </button>
      <a
        className="normal-case"
        onClick={() => {
          setDisplayUserMenu(!displayUserMenu);
        }}
      >
        {props.username}
      </a>

      {displayNotifMenu && (
        <NotificationMenu
          handleClose={() => {
            setDisplayNotifMenu(false);
          }}
          notifications={notifs}
          clientServer={props.clientServer}
          cookie={props.cookie}
        />
      )}
      {displayUserMenu && (
        <UserMenu
          username={props.username}
          handleClose={() => setDisplayUserMenu(false)}
        />
      )}
    </div>
  );
}
