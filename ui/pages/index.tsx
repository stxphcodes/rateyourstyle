import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";

import {
  GetOutfits,
  GetPublicOutfitsByUser,
  Outfit,
  OutfitItem,
} from "../apis/get_outfits";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { OutfitCard } from "../components/outfit/card";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
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

type Props = {
  cookie: string;
  clientServer: string;
  error: string | null;
  outfits: Outfit[] | null;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    error: null,
    outfits: null,
    clientServer: "",
    metadata: {
      title: "",
      description:
        "RateYourStyle is a fashion community to support people in finding their personal style. Use RateYourStyle to get outfit feedback and style advice, and to find fashion outfit inspo. You can also connect with professional stylists on RateYourStyle.",
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

function Home({ cookie, outfits, clientServer, error }: Props) {
  const [heroSectionOutfit, setHeroSectionOutfit] = useState(
    outfits ? outfits[0] : null
  );
  const [heroSectionOutfit2, setHeroSectionOutfit2] = useState(
    outfits ? outfits[1] : null
  );

  const [readMore, setReadMore] = useState(false);

  useEffect(() => {
    let id = setInterval(() => {
      if (outfits) {
        let num = Math.floor(Math.random() * outfits.length);
        let num2 = Math.floor(Math.random() * outfits.length);

        if (num !== num2) {
          setHeroSectionOutfit(outfits[num]);
          setHeroSectionOutfit2(outfits[num2]);
        }
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
          <h1 className="text-4xl text-center text-white pt-8">
            Welcome to RateYourStyle
          </h1>
          <h2 className="text-xl sm:text-2xl text-center uppercase pt-4 pb-8  m-auto text-white">
            a fashion community to help you find your personal style 🫶
          </h2>

          <div className="sm:w-3/4 m-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              {heroSectionOutfit && (
                <OutfitCard
                  cookie={cookie}
                  data={heroSectionOutfit}
                  userRating={null}
                  clientServer={clientServer}
                  verifiedBusiness={false}
                />
              )}
              {heroSectionOutfit2 && (
                <div className="hidden sm:block">
                  <OutfitCard
                    cookie={cookie}
                    data={heroSectionOutfit2}
                    userRating={null}
                    clientServer={clientServer}
                    verifiedBusiness={false}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-black">
          <h1 className="m-auto px-4 sm:px-8 py-8 sm:py-12 sm:text-center sm:animate-typing  sm:overflow-hidden sm:whitespace-nowrap text-white">
            For the fashionista, data nerd and stylist
          </h1>
          <div className="grid sm:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div
                className={`px-4 sm:px-8 sm:py-12 py-4 whitespace-pre-line ${item.bgcolor}`}
                key={`how-it-works-step-${index}`}
              >
                <div className="grid grid-cols-2 gap-4 items-start mt-4">
                  <div className="col-span-1 ">
                    <h2 className="pb-4 uppercase">{item.title}</h2>
                    {item.content}
                  </div>
                  <img
                    alt={`how-it-works-img-${index}`}
                    src={item.picture_url}
                    className=" border-4 border-black"
                  ></img>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-4 md:p-8">
          <h1 className="mb-4">Privacy</h1>
          <div>
            We want to be transparent with our visitors and users. Here&apos;s
            what you need to know about how we use the data gatherered on our
            platform:
            <ul className="list-decimal list-inside">
              <li className="py-2">
                RateYourStyle uses cookies to maintain your login session. The
                cookie is only used for the prupose of saving your login
                details.
              </li>
              <li className="pb-2">
                {" "}
                Each outfit post has its own visibility setting and your closet
                will only display clothing items from public outfit posts.
                Private outfits and its clothing items can only be viewed by
                you.
              </li>
              <li>
                RateYourStyle uses Aritifical Intelligence (AI) to enhance your
                experience. AI is used during the outfit posting process to help
                our users identify and describe outfit items.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const howItWorks = [
  {
    picture_url: "/screenshot-1.png",
    title: "Document your outfits with AI",
    bgcolor: "bg-custom-pink",
    content: (
      <div>
        Start building your virtual closet by posting your outfits. To make
        outfit submission quick and easy, we use AI to help you identify and
        describe outfit items.
      </div>
    ),
  },
  {
    picture_url: "/screenshot-5.png",
    title: "Gather data about your clothes",
    content: (
      <div>
        RateYourStyle aggregates your clothes into a virtual closet, and creates
        basic graphs to give you analytics such as most worn item, cost per
        wear, color analysis and more.
      </div>
    ),
    bgcolor: "bg-custom-lime",
  },
  {
    picture_url: "/screenshot-6.png",
    title: "Give & receive style advice",
    content: (
      <div>
        Find fashion inspo on our{" "}
        <Link href="/discover" passHref={true}>
          <a className="hover:text-custom-lime">Discover page</a>
        </Link>
        , and rate & review each other&apos;s outfits.
      </div>
    ),
    bgcolor: "bg-custom-pink",
  },
];

export default Home;
