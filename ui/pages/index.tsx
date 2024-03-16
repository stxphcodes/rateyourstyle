import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Campaign, GetCampaigns } from "../apis/get_campaigns";
import {
  GetOutfits,
  GetPublicOutfitsByUser,
  Outfit,
  OutfitItem,
} from "../apis/get_outfits";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { OutfitCard } from "../components/outfitcard";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { GetBusinesses } from "../apis/get_businesses";
import { CircleCheckIcon } from "../components/icons/circle-check";

const personalStylistList = [
  "Connect with new clients",
  "Get paid for outfit reviews and consultations",
  "Improve SEO for your styling business",
];

const fashionEnthusiastList = [
  "Document your favorite outfits",
  "Build your virtual closet",
  "Get style advice from real people or pay to get styling advice from a professional stylist",
];

const howItWorks = [
  {
    picture_url: "/screenshot-closet.png",
    title: "1. Upload your outfits",
    description: "Create an account and start posting your favorite outfits!",
    bgcolor: "custom-lime",
    content: (
      <div>
        Create an account and start posting your favorite outfits! Your outfits
        will populate your closet page.
        <br />
        <br />
        See an{" "}
        <a href="/closet/stxphcodes" className="hover:text-custom-pink">
          example closet here
        </a>
        .
      </div>
    ),
  },
  {
    picture_url: "/screenshot-requestfeedback.png",
    title: "2. Get outfit feedback",
    content: (
      <div>
        The Rate Your Style community will rate and review your outfits.
        <br />
        <br />
        (Coming Soon)
        <br /> There are professional stylists on Rate Your Style. If you'd like
        their specific outfit feedback, you can send a request to them directly.
      </div>
    ),
    bgcolor: "custom-pink",
  },
  {
    picture_url: "/screenshot-review.png",
    title: "3. Give outfit feedback",
    content: (
      <div>
        Use the{" "}
        <a href="/discover" className="hover:text-custom-pink">
          Discover page
        </a>{" "}
        to find fashion inspo, and to rate & review other users' outfits.
        <br />
        <br />
        (Coming Soon)
        <br />
        If other users like your style, they can request feedback from you. You
        can charge a styling fee if you'd like.
      </div>
    ),
    bgcolor: "custom-lime",
  },
];

type Props = {
  cookie: string;
  clientServer: string;
  error: string | null;
  outfits: Outfit[] | null;
  // outfitsForTable: Outfit[] | null;
  metadata: PageMetadata;
  businesses: string[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    error: null,
    outfits: null,
    clientServer: "",
    businesses: [],
    metadata: {
      title: "",
      description:
        "Rate Your Style i  a styling marketplace that connects people seeking fashion advice to personal stylists. Use Rate Your Style to get outfit feedback and style advice, and to find fashion outfit inspo.",
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

  const businessResp = await GetBusinesses(server, props.cookie);
  if (businessResp instanceof Error) {
    props.error = businessResp.message;
    return { props };
  }
  props.businesses = businessResp;

  const outfitResp = await GetOutfits(server, 8);
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

  return { props };
};

function Home({ cookie, outfits, clientServer, businesses, error }: Props) {
  const [heroSectionOutfit, setHeroSectionOutfit] = useState(
    outfits ? outfits[0] : null
  );
  const [heroSectionOutfit2, setHeroSectionOutfit2] = useState(
    outfits ? outfits[1] : null
  );

  useEffect(() => {
    let id = setInterval(() => {
      if (outfits) {
        let num = Math.floor(Math.random() * outfits.length);
        setHeroSectionOutfit(outfits[num]);

        let num2 = Math.floor(Math.random() * outfits.length);
        setHeroSectionOutfit2(outfits[num2]);
      }
    }, 3000);

    return () => clearInterval(id);
  }, []);

  if (error) {
    return <div>error {error} </div>;
  }

  return (
    <>
      <Navbar clientServer={clientServer} cookie={cookie} />
      <main className="">
        <section className="p-4 md:p-8 bg-gradient mt-8">
          <h1 className="text-4xl text-center py-8">
            Welcome to Rate Your Style, <br />
            An Innovative Styling Marketplace
          </h1>

          <div className="sm:w-3/4 m-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              {heroSectionOutfit && (
                <OutfitCard
                  cookie={cookie}
                  data={heroSectionOutfit}
                  userRating={null}
                  clientServer={clientServer}
                  verifiedBusiness={
                    businesses &&
                    businesses.filter((id) => heroSectionOutfit.username == id)
                      .length > 0
                      ? true
                      : false
                  }
                />
              )}
              {heroSectionOutfit2 && (
                <div className="hidden sm:block">
                  <OutfitCard
                    cookie={cookie}
                    data={heroSectionOutfit2}
                    userRating={null}
                    clientServer={clientServer}
                    verifiedBusiness={
                      businesses &&
                      businesses.filter(
                        (id) => heroSectionOutfit2.username == id
                      ).length > 0
                        ? true
                        : false
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="p-4 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-8">
            <div>
              <h1>For Personal Stylists</h1>
              <h5 className="my-4">
                Rate Your Style is a marketplace that connects people seeking
                fashion advice to personal stylists.
              </h5>
              <ul className="text-lg">
                {personalStylistList.map((item, index) => (
                  <li
                    key={`personal-stylist-reason-${index}`}
                    className="flex gap-2 items-center mb-4"
                  >
                    <div className="flex-none">
                      <CircleCheckIcon />
                    </div>
                    <div className="flex-none">{item}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h1>For Fashion Enthusiasts</h1>
              <h5 className="my-4">
                Rate Your Style is an online community for anyone interested in
                fashion.
              </h5>
              <ul className="text-lg">
                {fashionEnthusiastList.map((item, index) => (
                  <li
                    key={`fashion-enthusiast-reason-${index}`}
                    className="flex gap-2 items-center mb-4 flex-none"
                  >
                    <div className="shrink-0">
                      <CircleCheckIcon />
                    </div>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h1 className="px-4 md:px-8 py-8 bg-custom-tan">How It Works</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 ">
            {howItWorks.map((item) => (
              <div className={`p-8 whitespace-pre-line bg-${item.bgcolor}`}>
                <h2>{item.title}</h2>
                <div className="flex gap-2 items-start mt-4">
                  {item.content}
                  <img
                    src={item.picture_url}
                    className="w-1/2 border-4 border-black"
                  ></img>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-4 md:p-8">
          <h1 className="my-4">Privacy</h1>
          <div>
            We value your privacy. That&apos;s why each outfit post has its own
            visibility setting and your closet will only display clothing items
            from public outfit posts. Private outfits and its clothing items can
            only be viewed by you and the sponsor of a campaign if it uses a
            campaign #tag. <br />
            <br />
            Rate Your Style also uses cookies to maintain your login session.
            The cookie is only used for the purpose of saving your login
            details.
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
