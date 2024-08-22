import { GetServerSideProps } from "next";
import { useState, useEffect, useMemo } from "react";

import { OutfitItem } from "../../../apis/get_outfits";
import { GetPublicOutfitsByUser, Outfit } from "../../../apis/get_outfits";
import { GetRatings, Rating } from "../../../apis/get_ratings";
import { Navbar } from "../../../components/navarbar";
import { GetServerURL } from "../../../apis/get_server";
import { ClosetTable } from "../../../components/closet/table";
import { GetUserByUsername, User } from "../../../apis/get_user";
import { Footer } from "../../../components/footer";
import { RequestFeedbackModal } from "../../../components/modals/requestfeedback";
import { ClosetHeader } from "../../../components/closet/header";
import { PageMetadata } from "../../_app";

type Props = {
  cookie: string;
  error: string | null;
  outfits: Outfit[] | null;
  userRatings: Rating[] | null;
  clientServer: string;
  closetName: string;
  user: User | null;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    clientServer: "",
    cookie: "",
    error: null,
    outfits: null,
    userRatings: null,
    closetName: "",
    user: null,
    metadata: {
      title: "",
      description: "",
    },
  };

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  let closetName = context.query["username"];
  if (typeof closetName !== "string") {
    props.error = "missing username for closet";
    return { props };
  }
  props.closetName = closetName;
  props.metadata.title = closetName + "'s closet";
  props.metadata.description = "outfits by " + closetName;

  let server = GetServerURL();
  if (server instanceof Error) {
    props.error = server.message;
    return { props };
  }

  let cookie = context.req.cookies["rys-login"];
  props.cookie = cookie ? cookie : "";

  if (props.cookie) {
    const ratingResp = await GetRatings(server, props.cookie);
    if (ratingResp instanceof Error) {
      props.error = ratingResp.message;
      return { props };
    }
    props.userRatings = ratingResp;
  }

  const userResp = await GetUserByUsername(server, props.cookie, closetName);
  if (userResp instanceof Error) {
    props.error = userResp.message;
    return { props };
  }
  props.user = userResp;

  const resp = await GetPublicOutfitsByUser(server, props.cookie, closetName);
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
  outfits,
  userRatings,
  closetName,
  user,
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

  const [submitOutfitClicked, setSubmitOutfitClicked] = useState(false);

  if (error) {
    return (
      <>
        <Navbar clientServer={clientServer} cookie={cookie} />
        <main className="mt-12 sm:mt-20 p-3 md:p-8">
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
      <Navbar clientServer={clientServer} cookie={cookie} />
      {/* {!cookie && <AccountPromptModal clientServer={clientServer} />} */}
      <main className="mt-12 sm:mt-20 px-4 md:px-8">
        <section className="mb-4 flex flex-wrap gap-2">
          <ClosetHeader
            closetName={closetName}
            outfitCount={outfits ? outfits.length : 0}
            outfitItemCount={items ? items.length : 0}
            user={user}
            imageURLs={
              outfits && outfits.map((item) => item.picture_url_resized)
            }
          />

          <button
            className="bg-gradient rounded p-2 font-bold uppercase hover:scale-110 h-fit text-left text-white"
            onClick={(e) => {
              e.preventDefault();
              setSubmitOutfitClicked(true);
            }}
          >
            Like their style? <br />
            Request Outfit Feedback <br />
            from {closetName}
          </button>
        </section>
        <section>
          {!outfits || outfits.length == 0 ? (
            <div className="h-screen">
              <h3>😕 Empty</h3>
              Looks like the user hasn&apos;t posted any public outfits yet.
            </div>
          ) : (
            <ClosetTable
              outfits={outfits}
              cookie={cookie}
              clientServer={clientServer}
              userRatings={userRatings}
              outfitItemToIds={outfitItemToIds}
              items={items}
            />
          )}
        </section>
      </main>
      {submitOutfitClicked && (
        <RequestFeedbackModal
          clientServer={clientServer}
          cookie={cookie}
          handleClose={() => {
            setSubmitOutfitClicked(false);
          }}
          closetName={closetName}
        />
      )}
      <Footer />
    </>
  );
}
