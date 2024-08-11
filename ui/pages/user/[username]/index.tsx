import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";

import {
  GetOutfitsByUser,
  Outfit,
  OutfitItem,
} from "../../../apis/get_outfits";
import { GetRatings, Rating } from "../../../apis/get_ratings";
import { GetUser, User } from "../../../apis/get_user";
import { Navbar } from "../../../components/navarbar";
import { GetServerURL } from "../../../apis/get_server";
import { ClosetTable } from "../../../components/closet/table";
import { Footer } from "../../../components/footer";
import { UserProfileForm } from "../../../components/forms/user-profile";
import { UserGeneralForm } from "../../../components/forms/user-general";

type Props = {
  cookie: string;
  user: User;
  error: string | null;
  outfits: Outfit[] | null;
  userRatings: Rating[] | null;
  clientServer: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    clientServer: "",
    cookie: "",
    user: {
      username: "",
      email: "",
      user_profile: {
        age_range: "",
        department: "",
        weight_range: "",
        height_range: "",
      },
      user_general: {
        description: "",
        aesthetics: [],
        links: [],
        country: "",
      },
    },
    error: null,
    outfits: null,
    userRatings: null,
  };

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  let server = GetServerURL();
  if (server instanceof Error) {
    props.error = server.message;
    return { props };
  }

  let cookie = context.req.cookies["rys-login"];
  props.cookie = cookie ? cookie : "";

  if (cookie) {
    let username = context.query["username"];
    if (typeof username !== "string") {
      props.error = "missing username for closet";
      return { props };
    }

    const userResp = await GetUser(server, cookie);
    if (userResp instanceof Error) {
      props.error = userResp.message;
      return { props };
    }
    if (userResp.username !== username) {
      props.error = "forbidden";
      return { props };
    }
    props.user = userResp;

    const ratingResp = await GetRatings(server, props.cookie);
    if (ratingResp instanceof Error) {
      props.error = ratingResp.message;
      return { props };
    }
    props.userRatings = ratingResp;
  }

  const resp = await GetOutfitsByUser(server, props.cookie);
  if (resp instanceof Error) {
    props.error = resp.message;
    return { props };
  }
  props.outfits = resp;

  // sort outfits by date
  props.outfits.sort((a, b) => (a.date < b.date ? 1 : -1));

  return { props };
};

function Rating(props: { x: number; small?: boolean }) {
  return (
    <div
      style={{ fontSize: props.small ? "18px" : "30px" }}
      className="text-primary"
    >
      {props.x == 0 ? "?" : props.x}
    </div>
  );
}

export default function Index({
  clientServer,
  cookie,
  user,
  outfits,
  userRatings,
  error,
}: Props) {
  const outfitItemToIds: Map<string, string[]> = useMemo(() => {
    if (!outfits) {
      return new Map<string, string[]>();
    }

    let uniqueMap: Map<string, string[]> = new Map<string, string[]>();
    outfits.map((outfit) => {
      outfit.items.map((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, [outfit.id]);
        } else {
          let outfitIds = uniqueMap.get(item.id) || [];
          uniqueMap.set(item.id, outfitIds);
          outfitIds.push(outfit.id);
        }
      });
    });

    return uniqueMap;
  }, []);

  const items: OutfitItem[] = useMemo(() => {
    if (!outfits) {
      return [];
    }

    let arr: OutfitItem[] = [];
    let uniqueMap: Map<string, string[]> = new Map<string, string[]>();
    outfits.map((outfit) => {
      outfit.items.map((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, [outfit.id]);
          arr.push(item);
        }
      });
    });

    return arr;
  }, []);

  if (error) {
    if (error == "forbidden") {
      return (
        <>
          <Navbar clientServer={clientServer} cookie={cookie} />
          <main className="mt-12 sm:mt-20 px-4 md:px-8">
            <h1>✋ Forbidden </h1>
            Please sign in as the user to view their posts.
          </main>
        </>
      );
    }

    return (
      <>
        <Navbar clientServer={clientServer} cookie={cookie} />
        <main className="mt-12 sm:mt-20 px-4 md:px-8">
          <h1>😕 Oh no</h1>
          Looks like there&apos;s an error on our end. Please refresh the page
          in a few minutes. If the issue persists, please email
          rateyourstyle@gmail.com.
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        clientServer={clientServer}
        cookie={cookie}
        username={user.username}
      />
      <main className="mt-12 sm:mt-20 px-4 md:px-8">
        <section className="mb-4">
          <div className="bg-custom-pink p-2 rounded ">
            RateYourStyle is still being developed - we&apos;re working as fast
            as we can on new features. If there&apos;s an outfit you&apos;d like
            to edit, or want to report a bug or feature idea, please email
            rateyourstyle@gmail.com. Thank you for your patience and
            understanding 💛.
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <h1>Settings</h1>
            <div className="col-span-3">
              <div>
                <span className="font-bold mr-2">Username</span>
                {user.username}
              </div>
              <div>
                <span className="font-bold mr-2">Email</span>
                {user.email}
              </div>
            </div>

            <div>
              <h1>General</h1>
              <div className="text-sm">
                This data will appear at the top of your closet page.
              </div>
            </div>
            <div className="col-span-3">
              <UserGeneralForm
                clientServer={clientServer}
                cookie={cookie}
                user={user}
              />
            </div>
            <div>
              <h1>Profile</h1>
              <div className="text-sm">
                This data is only visible and accessible to you and is
                completely optional to complete. We have this section to help
                others with similar body types find clothes that fit them.
              </div>
            </div>
            <div className="col-span-3">
              <UserProfileForm
                clientServer={clientServer}
                cookie={cookie}
                user={user}
              />
            </div>
          </div>
        </section>

        {!outfits || outfits.length == 0 ? (
          <>
            <h1 className="text-gray-200">Your outfits go here.</h1>
            <p>
              Click{" "}
              <Link href="/post-outfit">
                <a className="underline text-primary">here</a>
              </Link>{" "}
              to post your first outfit.
            </p>
          </>
        ) : (
          <>
            <section className="my-4">
              <h1>Your Closet</h1>
              <div>
                <span className="font-bold">Share your closet: </span>{" "}
                <a target="_blank" href={`/closet/${user.username}`}>
                  https://rateyourstyle.com/closet/{user.username}
                </a>
              </div>
              <div className="text-xs mb-2">
                Only items from public outfits will be shared. Select items from
                your closet to see items that contain them.
              </div>
              <ClosetTable
                outfits={outfits}
                cookie={cookie}
                clientServer={clientServer}
                userRatings={userRatings}
                includeEdit={true}
                outfitItemToIds={outfitItemToIds}
                items={items}
              />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
