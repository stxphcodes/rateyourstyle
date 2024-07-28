import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

import { GetOutfits, Outfit } from "../apis/get_outfits";
import { GetRatings, Rating } from "../apis/get_ratings";
import { GetServerURL } from "../apis/get_server";
import { GetUser, User, UserProfile } from "../apis/get_user";
import { Footer } from "../components/footer";
import { AccountPromptModal } from "../components/modals/accountPrompt";
import { Navbar } from "../components/navarbar";
import { OutfitCard } from "../components/outfit/card";
import { PageMetadata } from "./_app";
import Searchbar from "../components/searchbar";

type Props = {
  cookie: string;
  clientServer: string;
  error: string | null;
  outfits: Outfit[] | null;
  userRatings: Rating[] | null;
  metadata: PageMetadata;
  user: User | null;
};

function checkEmptyUserProfile(profile: UserProfile) {
  if (!profile) {
    return true;
  }

  if (
    profile.age_range == "" &&
    profile.department == "" &&
    profile.height_range == "" &&
    profile.weight_range == ""
  ) {
    return true;
  }

  return false;
}

function findSimilarToMe(outfitUser: UserProfile, user: UserProfile) {
  if (user.age_range !== "") {
    if (outfitUser.age_range !== user.age_range) {
      return false;
    }
  }

  if (user.department !== "") {
    if (outfitUser.department !== user.department) {
      return false;
    }
  }

  if (user.height_range !== "") {
    if (outfitUser.height_range !== user.height_range) {
      return false;
    }
  }

  if (user.weight_range !== "") {
    if (outfitUser.weight_range !== user.weight_range) {
      return false;
    }
  }

  return true;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    userRatings: null,
    error: null,
    outfits: null,
    clientServer: "",
    user: null,
    metadata: {
      title: "Discover",
      description:
        "Discover fashion and outfit inspo from real people. Rate Your Style is a community for fashion lovers.",
    },
  };

  let server = GetServerURL();
  if (server instanceof Error) {
    props.error = server.message;
    return { props };
  }

  if (context.req.cookies["rys-login"]) {
    props.cookie = context.req.cookies["rys-login"];
  }

  if (props.cookie) {
    const ratingResp = await GetRatings(server, props.cookie);
    if (ratingResp instanceof Error) {
      props.error = ratingResp.message;
      return { props };
    }
    props.userRatings = ratingResp;

    const userProfileResp = await GetUser(server, props.cookie);
    if (!(userProfileResp instanceof Error)) {
      props.user = userProfileResp;
    }
  }

  const outfitResp = await GetOutfits(server);
  if (outfitResp instanceof Error) {
    props.error = outfitResp.message;
    return { props };
  }
  props.outfits = outfitResp;

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  // sort outfits by date
  props.outfits.sort((a, b) => (a.date < b.date ? 1 : -1));

  return { props };
};

function DiscoverPage({
  cookie,
  user,
  userRatings,
  outfits,
  clientServer,
  error,
}: Props) {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const [similarToMe, setSimilarToMe] = useState<boolean>(false);

  const [similarToMeError, setSimilarToMeError] = useState<string | null>(null);

  const [outfitsFiltered, setOutfitsFiltered] = useState<Outfit[] | null>(
    outfits
  );

  useEffect(() => {
    if (searchTerms.length == 0 && !similarToMe) {
      setOutfitsFiltered(outfits);
      return;
    }

    let filtered: Outfit[] = [];
    outfits?.forEach((outfit) => {
      let include = false;
      outfit.style_tags.forEach((tag) => {
        if (searchTerms.includes(tag)) {
          include = true;
          return;
        }
      });

      if (include) {
        filtered.push(outfit);
        return;
      }

      if (similarToMe && user && user.user_profile) {
        if (outfit?.user_profile) {
          if (findSimilarToMe(outfit.user_profile, user.user_profile)) {
            filtered.push(outfit);
          }
        }
      }
    });

    setOutfitsFiltered(filtered);
  }, [searchTerms, similarToMe]);

  const updateSearchResults = (outfitIds: string[]) => {
    if (outfitIds.length == 0) {
      setOutfitsFiltered(outfits);
      return;
    }

    let filtered: Outfit[] = [];
    outfits?.forEach((outfit) => {
      if (outfitIds.includes(outfit.id)) {
        filtered.push(outfit);
      }
    });

    setOutfitsFiltered(filtered);
  };

  const updateSearchNoResults = () => {
    setOutfitsFiltered([]);
  };

  if (error) {
    return <div>error {error} </div>;
  }

  return (
    <>
      <Navbar
        clientServer={clientServer}
        cookie={cookie}
        username={user?.username}
      />
      {!cookie && <AccountPromptModal clientServer={clientServer} />}
      <main className="mt-8 sm:mt-14 overflow-y-hidden">
        <section className="mb-4 p-4 md:p-8 bg-gradient ">
          <h1 className="mb-4">Discover Outfits and Stylists</h1>

          <div className="flex flex-wrap justify-start items-start gap-2 mb-4">
            <div className="bg-black text-white p-2 rounded w-60">
              <div className="flex gap-2 items-center">
                Similar to me
                <input
                  type="checkbox"
                  onChange={() => {
                    if (!user || !user.username) {
                      setSimilarToMeError("unknownUser");
                      return;
                    }

                    if (checkEmptyUserProfile(user.user_profile)) {
                      setSimilarToMeError("missingProfile");
                      return;
                    }

                    setSimilarToMe(!similarToMe);
                  }}
                  checked={similarToMe}
                ></input>
              </div>
              <div className="text-xs">
                Discover outfits from users that are similar in age, height, and
                weight.
              </div>
              {similarToMeError && (
                <div className="text-custom-pink">
                  {similarToMeError == "unknownUser"
                    ? "You must be signed into an account to use this filter."
                    : similarToMeError == "missingProfile" &&
                      "You must complete your user profile to use this filter."}
                </div>
              )}
            </div>
          </div>

          <Searchbar
            clientServer={clientServer}
            cookie={cookie}
            updateSearchResults={updateSearchResults}
            updateSearchNoResults={updateSearchNoResults}
          />
        </section>

        <section className="p-4 md:p-8 grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(!outfitsFiltered || outfitsFiltered.length == 0) && (
            <div className="h-screen">No results at this time </div>
          )}
          {outfitsFiltered &&
            outfitsFiltered.map((item) => {
              let userRating: Rating | null = null;
              if (userRatings) {
                userRating = userRatings?.filter(
                  (r) => r.outfit_id == item.id
                )[0];
              }

              return (
                <OutfitCard
                  cookie={cookie}
                  data={item}
                  key={item.id}
                  userRating={userRating}
                  clientServer={clientServer}
                  verifiedBusiness={false}
                />
              );
            })}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default DiscoverPage;
